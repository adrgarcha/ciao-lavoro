from django.contrib.auth.models import Group
from user.models import User
from service.models import Service, Job
from rest_framework import permissions, viewsets, generics

from api.serializers import GroupSerializer, UserSerializer, ServiceSerializer, JobSerializer, ContractSerializer
from contract.models import Contract


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]

class ServiceViewSet(viewsets.ModelViewSet):
    queryset = Service.objects.all()
    serializer_class = ServiceSerializer


class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer

    def get_queryset(self):
        """
        Sobrescribe el método `get_queryset` para filtrar los trabajos
        basados en el servicio proporcionado en la URL.
        """
        service_id = self.kwargs['service_id']  # Obtén el ID del servicio de la URL
        return Job.objects.filter(service_id=service_id)

class ContractViewSet(viewsets.ModelViewSet):
    queryset=Contract.objects.all()
    serializer_class=ContractSerializer   

class ContractClientList(generics.ListAPIView):
    serializer_class=ContractSerializer
    def get_queryset(self):
        user=self.request.user.id
        queryset=Contract.objects.filter(client=user)
        return queryset  
     
class ContractWorkerList(generics.ListAPIView):
    serializer_class=ContractSerializer
    def get_queryset(self):
        user=self.request.user.id
        queryset=Contract.objects.filter(worker=user)
        return queryset
