from django.urls import path
from rest_framework.routers import SimpleRouter
from .views import ArticleListView, ArticleDetailView, ArticleCategoryListView, ArticleAdminViewSet

# SimpleRouter (pas DefaultRouter) : DefaultRouter génère une vue "API root" sur le
# chemin racine ("") de CE routeur, qui entrait en collision avec le path("", ArticleListView)
# ci-dessous et le masquait (401 systématique sur la liste publique /blog/).
router = SimpleRouter()
router.register("manage/articles", ArticleAdminViewSet, basename="article-admin")

urlpatterns = [
    path("manage/categories/", ArticleCategoryListView.as_view(), name="article-category-list"),
    *router.urls,
    path("", ArticleListView.as_view(), name="article-list"),
    path("<slug:slug>/", ArticleDetailView.as_view(), name="article-detail"),
]
