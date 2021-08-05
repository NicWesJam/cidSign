# from django.contrib.auth.models import User, Group
from .models import Domain, LinkedAddress
from rest_framework import serializers


class LinkedAddressSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LinkedAddress
        fields = ['address', 'address_type', 'created', 'updated', 'domain', 'linked_domain', 'url', 'primary_key']


class NestedLinkedAddressSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = LinkedAddress
        fields = ['address', 'address_type', 'url']


class DomainSerializer(serializers.HyperlinkedModelSerializer):
    #linked_address = serializers.PrimaryKeyRelatedField(many=True, queryset=LinkedAddress.objects.all())
    class Meta:
        model = Domain
        fields = ['domain', 'url']


class DetailedDomainSerializer(serializers.HyperlinkedModelSerializer):
    linked_address = NestedLinkedAddressSerializer(many=True, read_only=True)
    class Meta:
        model = Domain
        fields = ['domain', 'url', 'linked_address']