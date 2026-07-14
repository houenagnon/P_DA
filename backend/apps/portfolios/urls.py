from django.urls import path
from .views import PublicPortfolioListView, MemberPortfolioView

urlpatterns = [
    path("", PublicPortfolioListView.as_view(), name="portfolio-list"),
    path("<slug:slug>/", MemberPortfolioView.as_view(), name="member-portfolio"),
]
