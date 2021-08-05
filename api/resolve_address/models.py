from django.db import models

choices=(
        ("btc", "btc"),
        ("eth", "eth"),
        ("ipfs", "ipfs"),
        ("filecoin", "filecoin"),
    )

# Create your models here.
class LinkedAddress(models.Model):

    primary_key = models.CharField("verbose primary key", max_length=151, primary_key=True)
    address = models.CharField("Relevant blockchain address", max_length=100) # relevant crypto address
    address_type = models.CharField("Blockchain type the relevant address", max_length=50, choices=choices) # type of crypto address
    created = models.DateTimeField("Datetime entry initially added", auto_now_add=True)
    updated = models.DateTimeField("Datetime entry last updated", auto_now=True)
    domain = models.ForeignKey('Domain', on_delete=models.CASCADE, related_name='linked_address')
    
    def save(self, *args, **kwargs):
        self.primary_key = self.address_type + "_" + self.address
        super(LinkedAddress, self).save(*args, **kwargs) # Call the "real" save() method.
    
    @property
    def linked_domain(self):
        return self.domain.domain


class Domain(models.Model):
    domain = models.CharField("Domain associated with relevant addresss must be in ******.*** format", primary_key=True, max_length=100)