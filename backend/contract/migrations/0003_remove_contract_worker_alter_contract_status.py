# Generated by Django 5.0.2 on 2024-03-10 19:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("contract", "0002_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="contract",
            name="worker",
        ),
        migrations.AlterField(
            model_name="contract",
            name="status",
            field=models.IntegerField(
                choices=[
                    (1, "Negociacion"),
                    (2, "Aceptado"),
                    (3, "En proceso"),
                    (4, "Finalizado"),
                    (5, "Cancelado"),
                    (6, "Pagado"),
                ],
                default=1,
            ),
        ),
    ]