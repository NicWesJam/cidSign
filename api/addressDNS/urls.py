from django.urls import include, path, re_path
from rest_framework import routers
from resolve_address import views

router = routers.DefaultRouter()
router.register(r'linked_address', views.LinkedAddressViewSet)
router.register(r'domain', views.DomainViewSet)

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.

user_list = views.DomainViewSet.as_view({'get': 'list'})
user_detail = views.DomainViewSet.as_view({'get': 'retrieve'})

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    #path('domain/', views.DomainViewSet.as_view({'get': 'list'}))
    #path('domain/<str:domain>/', views.DomainListView.as_view(), name="domain-detail"),
]

'''
re_path(r'^domain/(?P<pk>[^/]+)/$', views.DetailedDomainViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
}),name="domain-detail"),
'''