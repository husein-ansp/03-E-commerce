from django.contrib import admin

from .models import (
    Category,
    Order,
    OrderItem,
    Product,
    ProductImage,
    Review,
    Wishlist,
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name", "description")
    prepopulated_fields = {"slug": ("name",)}


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "category",
        "price",
        "stock",
        "rating",
        "is_featured",
        "is_active",
    )
    list_filter = (
        "category",
        "is_featured",
        "is_active",
    )
    search_fields = (
        "name",
        "brand",
        "description",
    )
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ("user", "product", "created_at")
    search_fields = (
        "user__username",
        "product__name",
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "product",
        "user",
        "rating",
        "is_verified_purchase",
        "is_approved",
        "created_at",
    )
    list_filter = (
        "rating",
        "is_verified_purchase",
        "is_approved",
    )
    search_fields = (
        "product__name",
        "user__username",
        "title",
        "comment",
    )


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_number",
        "user",
        "status",
        "total",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "order_number",
        "user__username",
        "email",
        "phone",
    )
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order",
        "product_name",
        "price",
        "quantity",
    )
    search_fields = (
        "product_name",
        "order__order_number",
    )