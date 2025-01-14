from django.db import models
from user.models import User
from django.db.models import Avg
from django.core.validators import MaxValueValidator, MinValueValidator

# Este campo es un campo custom para llevar el enumerado de profession
# Abajo en el modelo se rellena y se le da una relación a cada integer con una profesión

class EnumField(models.IntegerField):

    def __init__(self, choices, *args, **kwargs):
        self.enum_choices = choices
        kwargs['choices'] = choices
        super().__init__(*args, **kwargs)

    def deconstruct(self):
        name, path, args, kwargs = super().deconstruct()
        kwargs['choices'] = self.enum_choices
        return name, path, args, kwargs

# Create your models here.

class Service(models.Model):
    class Meta:
        verbose_name = "service"
        verbose_name_plural = "services"

    # se ha puesto nullable para evitar problemas con Django
    user = models.ForeignKey(User,default=None, null=True, on_delete=models.CASCADE)
    #Aquí se enumeran las profesiones posibles
    PROFESSIONS = [
        (1, 'Lavandero'),
        (2, 'Celador'),
        (3, 'Albañil'),
        (4, 'Carpintero'),
        (5, 'Cerrajero'),
        (6, 'Mecánico'),
        (7, 'Electricista'),
        (8, 'Conductor'),
        (9, 'Pintor'),
        (10, 'Herrero'),
        (11, 'Sastre'),
        (12, 'Profesor particular'),
    ]
    profession = models.IntegerField(choices = PROFESSIONS, blank = False)
    city = models.TextField(blank = False, max_length=200)
    experience = models.PositiveIntegerField(blank = False,validators=[MinValueValidator(0), MaxValueValidator(80)])
    #Aquí se estipulan si está ofertando trabajo con este servicio
    is_active = models.BooleanField(blank = False,default=True)
    #Aquí se estipula si está promocionado este servicio
    is_promoted = models.DateField(null = True)
    def rating(self):
        #La siguiente linea fue creada a partir de la IA Phind
        return self.review_set.all().aggregate(Avg('rating'))['rating__avg'] or 0

    def __str__(self):
        return self.user.username+" ("+self.get_profession_display()+")"

class Job(models.Model):

    class Meta:
        verbose_name = "job"
        verbose_name_plural = "jobs"
    #Aqui se registra el servicio al que pertenece,
    # se ha puesto nullable para evitar problemas con Django
    service = models.ForeignKey(Service, default=None, null=True, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, blank = False)
    estimated_price = models.DecimalField(
                    max_digits=7,
                    decimal_places=2,
                    validators=[MinValueValidator(0.01)],
                    help_text=('Introduzca el coste en euros'))

    def __str__(self) -> str:
        return self.name

class Review(models.Model):

    class Meta:
        verbose_name = "review"
        verbose_name_plural = "reviews"
    user = models.ForeignKey(User,default=None, null=True, on_delete=models.CASCADE)
    service = models.ForeignKey(Service, default=None, null=True, on_delete=models.CASCADE)
    description = models.CharField(max_length=500, blank = True, default= None)
    date = models.DateTimeField(null=True)
    rating = models.PositiveIntegerField(validators=[MaxValueValidator(5)], null= False)

    def __str__(self) -> str:
        return f"{self.service.user.username}, {self.service.get_profession_display()}, {self.user.username}"