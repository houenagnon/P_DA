import django_filters
from .models import Event


class EventFilter(django_filters.FilterSet):
    date_after = django_filters.DateTimeFilter(field_name="start_date", lookup_expr="gte")
    date_before = django_filters.DateTimeFilter(field_name="start_date", lookup_expr="lte")

    class Meta:
        model = Event
        fields = ["event_type", "is_published"]
