from rest_framework.permissions import BasePermission


def is_bureau(user) -> bool:
    """Un membre du bureau est quiconque a un poste (Président, VP, ...) ou est admin."""
    return bool(getattr(user, "poste", None)) or getattr(user, "role", None) == "admin"


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == "admin")


class IsBureau(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and is_bureau(request.user))


class IsAdminOrBureau(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and is_bureau(request.user))


class IsMembre(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role == "membre"
        )


class IsAdminOrPresident(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and (request.user.role == "admin" or request.user.poste == "president")
        )


class IsOwnerOrAdmin(BasePermission):
    """Propriétaire de l'objet (user/owner/created_by), admin, ou membre du bureau."""
    def has_object_permission(self, request, view, obj):
        if is_bureau(request.user):
            return True
        owner = getattr(obj, "user", getattr(obj, "owner", getattr(obj, "created_by", None)))
        return owner == request.user
