from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MemberListView, MyProfileView, PublicMemberListView, PublicProfileView,
    MemberExperienceViewSet, MemberCertificationViewSet, SocialLinkViewSet,
)

router = DefaultRouter()
router.register("me/experiences", MemberExperienceViewSet, basename="member-experience")
router.register("me/certifications", MemberCertificationViewSet, basename="member-certification")
router.register("me/social-links", SocialLinkViewSet, basename="member-social-link")

urlpatterns = [
    path("", MemberListView.as_view(), name="member-list"),
    path("me/profile/", MyProfileView.as_view(), name="member-my-profile"),
    path("public/", PublicMemberListView.as_view(), name="member-public-list"),
    path("public/<slug:slug>/", PublicProfileView.as_view(), name="member-public-profile"),
    path("", include(router.urls)),
]

