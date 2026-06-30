from rest_framework.permissions import BasePermission

BUREAU_ROLES = {
    "president", "vp1", "vp2",
    "secretaire_general", "secretaire_general_adj",
    "tresorier", "tresorier_adj",
}


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsBureau(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in BUREAU_ROLES)


class IsAdminOrBureau(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.role in BUREAU_ROLES)
        )


class IsMembre(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in {"membre", "mentor", "formateur"}
        )


class IsAdminOrPresident(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in {"admin", "president"}
        )


class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        owner = getattr(obj, "user", getattr(obj, "created_by", None))
        return owner == request.user
