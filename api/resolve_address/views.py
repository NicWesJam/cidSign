from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Domain, LinkedAddress
from .serializers import LinkedAddressSerializer, DomainSerializer, DetailedDomainSerializer
from .get_DNS_address import get_DNS_address


class LinkedAddressViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows linkedAddress to be viewed or edited (by authenticated users).
    """
    queryset = LinkedAddress.objects.all()
    serializer_class = LinkedAddressSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class DomainViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows Domains holding crypto addresses to be viewed.
    To add/check a domain simply go to thinkingzoo.com/domain/yourdomain.com/
    where yourdomain.com is the domain you want to go to
    Must be in the format *****.***** no additional www, subdomains or https, etc.
    """
    queryset = Domain.objects.all()
    serializer_class = DomainSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_value_regex = '[^/]+' # this lines replaces the regex that excludes "."
    #lookup_field = 'domain'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return DetailedDomainSerializer
        return DomainSerializer

    def retrieve(self, request, *args, **kwargs):
        # do your customization here
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        temp = serializer.data.get('domain', None)
        return Response(serializer.data)

    def get_object(self):
        '''
        double check the domain for crypto data
        update the model
        then continue with remainder of normal get_object flow
        '''

        # getdata from DNS server
        # save data to database, if it exists

        queryset = self.filter_queryset(self.get_queryset())

        # Perform the lookup filtering.
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field

        # Inserted code starts here
        # attempt to delete any existing enteries
        domain = Domain.objects.all().filter(domain=self.kwargs[lookup_url_kwarg])
        if len(domain) > 0:
            #print(domain[0])
            domain[0].delete()

        # get address DNS info
        DNS_address = get_DNS_address()
        DNS_address.get_DNS_address(self.kwargs[lookup_url_kwarg])
        if len(DNS_address.parsed_response) >= 1:
            # We have results on this domain

            # Add the Domain
            new_domain = Domain(domain=self.kwargs[lookup_url_kwarg])
            new_domain.save()

            # Loop through and add each linked account
            for line in DNS_address.parsed_response:
                new_address = LinkedAddress(
                    address = line['address'],
                    address_type = line['type'],
                    domain = new_domain,
                )
                new_address.save()

        # Inserted code ends here

        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )

        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        # this raises 404 if object doens't exist
        obj = get_object_or_404(queryset, **filter_kwargs)
        
        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        
        return obj