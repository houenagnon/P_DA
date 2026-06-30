from django.urls import path
from .views import (
    CandidatureCreateView, CandidatureListView,
    CandidatureDetailView, ReviewCandidatureView,
)

urlpatterns = [
    path("candidatures/", CandidatureCreateView.as_view(), name="candidature-create"),
    path("candidatures/list/", CandidatureListView.as_view(), name="candidature-list"),
    path("candidatures/<int:pk>/", CandidatureDetailView.as_view(), name="candidature-detail"),
    path("candidatures/<int:pk>/review/", ReviewCandidatureView.as_view(), name="candidature-review"),
]
