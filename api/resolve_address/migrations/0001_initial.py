# Generated by Django 3.2.5 on 2021-08-01 15:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Domain',
            fields=[
                ('domain', models.CharField(max_length=100, primary_key=True, serialize=False, verbose_name='Domain associated with relevant addresss must be in ******.*** format')),
            ],
        ),
        migrations.CreateModel(
            name='LinkedAddress',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('primary_key', models.CharField(max_length=151, verbose_name='verbose primary key')),
                ('address', models.CharField(max_length=100, verbose_name='Relevant blockchain address')),
                ('address_type', models.CharField(choices=[('btc', 'btc'), ('eth', 'eth'), ('ipfs', 'ipfs'), ('filecoin', 'filecoin')], max_length=50, verbose_name='Blockchain type the relevant address')),
                ('created', models.DateTimeField(auto_now_add=True, verbose_name='Datetime entry initially added')),
                ('updated', models.DateTimeField(auto_now=True, verbose_name='Datetime entry last updated')),
                ('domain', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='linked_address', to='resolve_address.domain')),
            ],
        ),
    ]
