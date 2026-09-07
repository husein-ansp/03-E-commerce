from django.urls import path

from . import views


urlpatterns = [
    path("", views.home, name="home"),
    path("products/", views.products, name="products"),
    path(
        "products/<int:product_id>/",
        views.product_detail,
        name="product_detail"
    ),
    path("cart/", views.cart, name="cart"),
    path("cart/data/", views.cart_data, name="cart_data"),
    path("cart/add/", views.add_to_cart, name="add_to_cart"),
    path("cart/update/", views.update_cart, name="update_cart"),
    path("cart/remove/", views.remove_from_cart, name="remove_from_cart"),
    path("checkout/", views.checkout, name="checkout"),
    path("tracking/", views.tracking, name="tracking"),
    path("profile/", views.profile, name="profile"),
    path("wishlist/", views.wishlist, name="wishlist"),
    path(
        "wishlist/toggle/",
        views.toggle_wishlist,
        name="toggle_wishlist"
    ),
    path("orders/", views.orders, name="orders"),
]