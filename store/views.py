import json
from decimal import Decimal

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render

from .models import Category, Order, OrderItem, Product, Wishlist


def get_cart(request):
    return request.session.get("cart", {})


def save_cart(request, cart):
    request.session["cart"] = cart
    request.session.modified = True


def get_cart_data(request):
    cart = get_cart(request)

    items = []
    subtotal = Decimal("0.00")

    for product_id, quantity in cart.items():
        product = Product.objects.filter(
            id=product_id
        ).select_related("category").first()

        if not product:
            continue

        quantity = int(quantity)

        if quantity <= 0:
            continue

        item_total = product.price * quantity
        subtotal += item_total

        image = ""

        if product.image:
            image = product.image.url

        items.append({
            "id": product.id,
            "name": product.name,
            "category": product.category.name,
            "price": float(product.price),
            "quantity": quantity,
            "subtotal": float(item_total),
            "image": image,
        })

    shipping = Decimal("5.00") if items else Decimal("0.00")
    total = subtotal + shipping

    count = sum(
        item["quantity"]
        for item in items
    )

    return {
        "items": items,
        "count": count,
        "subtotal": float(subtotal),
        "shipping": float(shipping),
        "total": float(total),
    }


def home(request):
    featured_products = Product.objects.filter(
        is_featured=True
    ).select_related("category")[:8]

    categories = Category.objects.all()

    sale_products = Product.objects.filter(
        is_sale=True
    ).select_related("category")[:4]

    return render(
        request,
        "store/home.html",
        {
            "featured_products": featured_products,
            "categories": categories,
            "sale_products": sale_products,
        }
    )


def products(request):
    products_list = Product.objects.select_related(
        "category"
    ).all()

    query = request.GET.get(
        "q",
        ""
    ).strip()

    category = request.GET.get(
        "category",
        ""
    ).strip()

    min_price = request.GET.get(
        "min_price",
        ""
    ).strip()

    max_price = request.GET.get(
        "max_price",
        ""
    ).strip()

    sort = request.GET.get(
        "sort",
        ""
    ).strip()

    sale = request.GET.get(
        "sale",
        ""
    ).strip()

    if query:
        products_list = products_list.filter(
            name__icontains=query
        )

    if category:
        products_list = products_list.filter(
            category__slug=category
        )

    if min_price:
        try:
            products_list = products_list.filter(
                price__gte=Decimal(min_price)
            )
        except (ValueError, TypeError):
            pass

    if max_price:
        try:
            products_list = products_list.filter(
                price__lte=Decimal(max_price)
            )
        except (ValueError, TypeError):
            pass

    if sale == "true":
        products_list = products_list.filter(
            is_sale=True
        )

    if sort == "price-low":
        products_list = products_list.order_by("price")

    elif sort == "price-high":
        products_list = products_list.order_by("-price")

    elif sort == "rating":
        products_list = products_list.order_by("-rating")

    elif sort == "oldest":
        products_list = products_list.order_by("created_at")

    else:
        products_list = products_list.order_by("-created_at")

    return render(
        request,
        "store/products.html",
        {
            "products": products_list,
            "categories": Category.objects.all(),
            "query": query,
            "selected_category": category,
            "min_price": min_price,
            "max_price": max_price,
            "selected_sort": sort,
        }
    )


def product_detail(request, product_id):
    product = get_object_or_404(
        Product.objects.select_related("category"),
        id=product_id
    )

    reviews = product.reviews.select_related(
        "user"
    ).all()

    return render(
        request,
        "store/product-detail.html",
        {
            "product": product,
            "reviews": reviews,
        }
    )


def cart(request):
    return render(
        request,
        "store/cart.html"
    )


def cart_data(request):
    return JsonResponse(
        get_cart_data(request)
    )


def add_to_cart(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid request."},
            status=405
        )

    try:
        data = json.loads(request.body)
        product_id = str(data.get("product_id"))
        quantity = int(data.get("quantity", 1))
    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid data."},
            status=400
        )

    product = get_object_or_404(
        Product,
        id=product_id
    )

    if quantity < 1:
        quantity = 1

    if product.stock <= 0:
        return JsonResponse(
            {"error": "This product is out of stock."},
            status=400
        )

    cart = get_cart(request)

    current_quantity = int(
        cart.get(product_id, 0)
    )

    new_quantity = current_quantity + quantity

    if new_quantity > product.stock:
        new_quantity = product.stock

    cart[product_id] = new_quantity

    save_cart(
        request,
        cart
    )

    return JsonResponse({
        "success": True,
        "message": "Product added to cart.",
        "count": get_cart_data(request)["count"],
    })


def update_cart(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid request."},
            status=405
        )

    try:
        data = json.loads(request.body)

        product_id = str(
            data.get("product_id")
        )

        action = data.get("action")

    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid data."},
            status=400
        )

    product = get_object_or_404(
        Product,
        id=product_id
    )

    cart = get_cart(request)

    if product_id not in cart:
        return JsonResponse(
            {"error": "Product is not in cart."},
            status=404
        )

    quantity = int(
        cart[product_id]
    )

    if action == "increase":
        if quantity < product.stock:
            quantity += 1

    elif action == "decrease":
        quantity -= 1

    if quantity <= 0:
        del cart[product_id]
    else:
        cart[product_id] = quantity

    save_cart(
        request,
        cart
    )

    return JsonResponse({
        "success": True,
        **get_cart_data(request),
    })


def remove_from_cart(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid request."},
            status=405
        )

    try:
        data = json.loads(request.body)

        product_id = str(
            data.get("product_id")
        )

    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid data."},
            status=400
        )

    cart = get_cart(request)

    if product_id in cart:
        del cart[product_id]

    save_cart(
        request,
        cart
    )

    return JsonResponse({
        "success": True,
        **get_cart_data(request),
    })


@login_required
def wishlist(request):
    wishlist_items = Wishlist.objects.filter(
        user=request.user
    ).select_related(
        "product",
        "product__category"
    )

    products_list = [
        item.product
        for item in wishlist_items
    ]

    return render(
        request,
        "store/wishlist.html",
        {
            "products": products_list
        }
    )


@login_required
def toggle_wishlist(request):
    if request.method != "POST":
        return JsonResponse(
            {"error": "Invalid request."},
            status=405
        )

    try:
        data = json.loads(request.body)

        product_id = int(
            data.get("product_id")
        )

    except (ValueError, TypeError, json.JSONDecodeError):
        return JsonResponse(
            {"error": "Invalid data."},
            status=400
        )

    product = get_object_or_404(
        Product,
        id=product_id
    )

    item = Wishlist.objects.filter(
        user=request.user,
        product=product
    ).first()

    if item:
        item.delete()
        added = False
        message = "Removed from wishlist."

    else:
        Wishlist.objects.create(
            user=request.user,
            product=product
        )
        added = True
        message = "Added to wishlist."

    count = Wishlist.objects.filter(
        user=request.user
    ).count()

    return JsonResponse({
        "success": True,
        "added": added,
        "count": count,
        "message": message,
    })


@login_required
def checkout(request):
    cart_info = get_cart_data(request)

    if not cart_info["items"]:
        return redirect("cart")

    if request.method == "POST":
        first_name = request.POST.get(
            "first_name",
            ""
        ).strip()

        last_name = request.POST.get(
            "last_name",
            ""
        ).strip()

        email = request.POST.get(
            "email",
            ""
        ).strip()

        phone = request.POST.get(
            "phone",
            ""
        ).strip()

        address = request.POST.get(
            "address",
            ""
        ).strip()

        city = request.POST.get(
            "city",
            ""
        ).strip()

        postal_code = request.POST.get(
            "postal_code",
            ""
        ).strip()

        payment_method = request.POST.get(
            "payment_method",
            "card"
        )

        required_fields = [
            first_name,
            last_name,
            email,
            phone,
            address,
            city,
            postal_code,
        ]

        if not all(required_fields):
            return render(
                request,
                "store/checkout.html",
                {
                    "cart": cart_info,
                    "error": "Please fill in all required fields.",
                }
            )

        for item in cart_info["items"]:
            product = Product.objects.get(
                id=item["id"]
            )

            if item["quantity"] > product.stock:
                return render(
                    request,
                    "store/checkout.html",
                    {
                        "cart": cart_info,
                        "error": (
                            f"Not enough stock for "
                            f"{product.name}."
                        ),
                    }
                )

        order = Order.objects.create(
            user=request.user,
            first_name=first_name,
            last_name=last_name,
            email=email,
            phone=phone,
            address=address,
            city=city,
            postal_code=postal_code,
            payment_method=payment_method,
            total=Decimal(
                str(cart_info["total"])
            ),
        )

        for item in cart_info["items"]:
            product = Product.objects.get(
                id=item["id"]
            )

            quantity = item["quantity"]

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price,
            )

            product.stock -= quantity

            product.save(
                update_fields=["stock"]
            )

        save_cart(
            request,
            {}
        )

        return redirect(
            f"/tracking/?order={order.id}"
        )

    return render(
        request,
        "store/checkout.html",
        {
            "cart": cart_info
        }
    )


@login_required
def tracking(request):
    order = None

    order_id = request.GET.get(
        "order"
    )

    if order_id:
        order = Order.objects.filter(
            id=order_id,
            user=request.user
        ).prefetch_related(
            "items",
            "items__product"
        ).first()

    if order is None:
        order = Order.objects.filter(
            user=request.user
        ).prefetch_related(
            "items",
            "items__product"
        ).first()

    return render(
        request,
        "store/tracking.html",
        {
            "order": order
        }
    )


@login_required
def profile(request):
    if request.method == "POST":
        request.user.first_name = request.POST.get(
            "first_name",
            ""
        ).strip()

        request.user.last_name = request.POST.get(
            "last_name",
            ""
        ).strip()

        request.user.email = request.POST.get(
            "email",
            ""
        ).strip()

        request.user.save()

        return redirect("profile")

    return render(
        request,
        "store/profile.html"
    )


@login_required
def orders(request):
    user_orders = Order.objects.filter(
        user=request.user
    ).prefetch_related(
        "items",
        "items__product"
    )

    return render(
        request,
        "store/orders.html",
        {
            "orders": user_orders
        }
    )