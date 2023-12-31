import { API_URL } from './config.js';
import { price } from './config.js';


const cartDataControl = {
    get() {
        // добавляем || '[]', чтобы при первом входе (пустой корзине) не получить null 
        return JSON.parse(localStorage.getItem("FreshyBarCart") || '[]');
    },
    add(item) {
        const cartData = this.get();
        item.idls = Math.random().toString(36).substring(2, 8);
        cartData.push(item);
        localStorage.setItem("FreshyBarCart", JSON.stringify(cartData));
    },
    remove(idls) {
        const cartData = this.get();
        const index = cartData.findIndex((item) => item.idls === idls);
        // если не находит, возвращает -1
        if (index !== -1) {
            cartData.splice(index, 1);
        }
        localStorage.setItem("FreshyBarCart", JSON.stringify(cartData));
    },
    clear() {
        localStorage.removeItem("FreshyBarCart");
    }
}

const getData = async () => {
    // const response = await fetch(API_URL + 'api/goods');
    const response = await fetch(`${API_URL}api/goods`);
    const data = await response.json();
    return data;
}

const createCard = (item) => {
    // console.log(item);
    const cocktail = document.createElement('article');
    cocktail.classList.add('cocktail');
    cocktail.innerHTML = `
    <img class="cocktail__img" src="${API_URL}${item.image}" alt="strawberry">
                            <div class="cocktail__content">
                                <div class="cocktail__text">
                                    <h3 class="cocktail__title">${item.title}</h3>
                                    <p class="cocktail__price text-red">${item.price}</p>
                                    <p class="cocktail__size">${item.size}</p>
                                </div>
                                <button class="btn cocktail__btn cocktail__btn_add" data-id="${item.id}">Добавить</button>
                            </div>
    `
    return cocktail;
}

const scrollService = {
    scrollPosition: 0,
    disabledScroll() {
        this.scrollPosition = window.scrollY;
        document.documentElement.style.scrollBehavior = 'auto';
        // console.log(this.scrollPosition);
        document.body.style.cssText = `
        overflow: hidden;
        position: relative;        
        top: -${this.scrollPosition}px;
        left: 0;
        height: 100vh;
        weight: 100vw;
        padding-right: ${window.innerWidth - document.body.offsetWidth}px;
        `;
    },
    enabledScroll() {
        document.body.style.cssText = "";
        window.scroll({ top: this.scrollPosition });
        // documentElement это html
        document.documentElement.style.scrollBehavior = "";
    },
};


const modalController = ({ modal, btnOpen, time = 300, open, close }) => {
    const buttonElems = document.querySelectorAll(btnOpen);
    const modalElem = document.querySelector(modal);

    modalElem.style.cssText = `
    display: flex;
    visibility: hidden;
    opacity: 0;
    transition: opacity ${time}ms ease-in-out;
    `;

    const closeModal = (event) => {
        // нужен target - при нажатии на фон будет закрываться модальное окно, внутри окна можно будет работать (оно не будет закрываться при нажатии на элементы внутри окна)
        const target = event.target;
        const code = event.code;
        // console.log(code);
        // code - клавиша, которая нажата на клавиатуре
        if (event === 'close' || target === modalElem || code === "Escape") {
            modalElem.style.opacity = 0;
            setTimeout(() => {
                modalElem.style.visibility = "hidden";
                scrollService.enabledScroll();
                if (close) {
                    close();
                }
            }, time);
            window.removeEventListener('keydown', closeModal);
        }
    }

    const openModal = (e) => {
        if (open) {
            open({ btn: e.target });
        }
        modalElem.style.visibility = "visible";
        modalElem.style.opacity = 1;
        window.addEventListener('keydown', closeModal);
        scrollService.disabledScroll();
    };


    buttonElems.forEach(buttonElem => {
        // console.log(buttonElem);
        buttonElem.addEventListener('click', openModal);
    })

    modalElem.addEventListener('click', closeModal);

    modalElem.closeModal = closeModal;
    modalElem.openModal = openModal;

    // возвращаем объект, т.к. если прсто перечислить функции, то вернется только последняя
    return { openModal, closeModal };
}

const getFormData = (form) => {
    const formData = new FormData(form);
    const data = {};
    // console.log("formData  ", formData.getAll("ingredients"));
    for (const [name, value] of formData.entries()) {
        if (data[name]) {
            if (!Array.isArray(data[name])) {
                data[name] = [data[name]];
            }
            data[name].push(value)
        } else {
            data[name] = value;
        }
    }
    // console.log(data);
    return data;
}


const calculateTotalPrice = (form, startPrice) => {
    let totalPrice = startPrice;
    const data = getFormData(form);
    if (Array.isArray(data.ingredients)) {
        data.ingredients.forEach((item) => {
            totalPrice += price[item] || 0;
        });
    } else {
        totalPrice += price[data.ingredients] || 0;
    }

    if (Array.isArray(data.topping)) {
        data.topping.forEach((item) => {
            totalPrice += price[item] || 0;
        });
    } else {
        totalPrice += price[data.topping] || 0;
    }

    totalPrice += price[data.cup] || 0;

    return totalPrice;
}




const formControl = (form, cb) => {
    form.addEventListener("submit", (e) => {
        // чтобы страница не перезагружалась
        e.preventDefault();
        const data = getFormData(form);
        cartDataControl.add(data);
        if (cb) {
            cb();
        }
    });
}



const calculateMakeYourOwwn = () => {
    const modalMakeOwn = document.querySelector('.modal_make-your-own');
    const formMakeOwn = modalMakeOwn.querySelector('.make__form_make-your-own');
    // const makeInputPrice = formMakeOwn.querySelector('.make__input_price');
    const makeInputPrice = modalMakeOwn.querySelector('.make__input_price');
    const makeTotalPrice = modalMakeOwn.querySelector('.make__total-price');
    const makeInputTitle = modalMakeOwn.querySelector(".make__input-title");
    const makeAddBtn = modalMakeOwn.querySelector(".make__add-btn");

    const handlerChange = () => {
        const totalPrice = calculateTotalPrice(formMakeOwn, 150);
        // value - т.к это input

        const data = getFormData(formMakeOwn);
        if (data.ingredients) {
            const ingredients = Array.isArray(data.ingredients)
                ? data.ingredients.join(", ")
                : data.ingredients;

            makeInputTitle.value = `Конструктор: ${ingredients}`;
            makeAddBtn.disabled = false;
        } else {
            makeAddBtn.disabled = true;
        }



        makeInputPrice.value = totalPrice;
        // textContent - т.к это p
        makeTotalPrice.textContent = `${totalPrice} ₽`;
    };

    formMakeOwn.addEventListener('change', handlerChange);
    formControl(formMakeOwn, () => {
        modalMakeOwn.closeModal("close");
    });
    handlerChange();

    const resetForm = () => {
        // makeTitle.textContent = "";
        makeTotalPrice.textContent = "";
        makeAddBtn.disabled = true;
        formMakeOwn.reset();
    }
    return { resetForm };
};

const calculateAdd = () => {
    const modalAdd = document.querySelector('.modal_add');
    const formAdd = document.querySelector('.make__form_add');
    const makeTitle = modalAdd.querySelector('.make__title');
    const makeInputTitle = modalAdd.querySelector('.make__input-title');
    const makeInputStartPrice = modalAdd.querySelector('.make__input-start-price');
    const makeInputPrice = modalAdd.querySelector('.make__input-price');
    const makeTotalPrice = modalAdd.querySelector('.make__total-price');
    const makeInputSize = modalAdd.querySelector('.make__input-size');
    const makeTotalSize = modalAdd.querySelector('.make__total-size');


    const handlerChange = () => {
        const totalPrice = calculateTotalPrice(formAdd, +makeInputStartPrice.value);
        makeInputPrice.value = totalPrice;
        makeTotalPrice.textContent = `${totalPrice} ₽`;
    }

    formAdd.addEventListener('change', handlerChange);
    formControl(formAdd, () => {
        modalAdd.closeModal('close')
    })


    const fillInForm = (data) => {
        makeTitle.textContent = data.title;
        makeInputTitle.value = data.title;
        makeInputStartPrice.value = data.price;
        makeInputPrice.value = data.price;

        // используем innerHTML вместо textContent, т.к используем непрерывный пробел &nbsp;
        makeTotalPrice.innerHTML = `${data.price}&nbsp;₽`;

        makeInputSize.value = data.size;
        makeTotalSize.textContent = data.size;
        console.log(data);
        handlerChange();
    }

    const resetForm = () => {
        makeTitle.textContent = "";
        makeTotalPrice.textContent = "";
        makeTotalSize.textContent = "";
        // для очистки всех value в форме
        formAdd.reset();
    }

    return { fillInForm, resetForm };
}

const createCartItem = (item) => {
    const li = document.createElement('li');
    li.classList.add('order__item');
    li.innerHTML = `<img class="order__img" src="img/kiwi.jpg" alt="${item.title}">
                        <div class="order__info">
                            <h3 class="order__name">${item.title}</h3>
                            <ul class="order__topping-list">
                                <li class="order_topping-item">${item.size}</li>
                                <li class="order_topping-item">${item.cup}</li>
                                ${item.topping
            ? Array.isArray(item.topping)
                ? item.topping.map(
                    (topping) =>
                        `<li class="order_topping-item">${topping}</li>`,
                )
                : `<li class="order_topping-item">${item.topping}</li>`
            : ""
        }
                            </ul>
                        </div>
                        <button class="order_item-delete" data-idls="${item.idls}" aria-label="Удалить коктейль из корзины"></button>
                        <p class="order__item-price">${item.price}&nbsp;₽</p>`;
    return li;
}


const renderCart = () => {
    const modalOrder = document.querySelector('.modal_order');
    const orderCount = modalOrder.querySelector('.order__count');
    const orderList = modalOrder.querySelector('.order__list');
    const orderTotalPrice = modalOrder.querySelector('.order__total-price');
    const orderForm = modalOrder.querySelector('.order__form');

    const orderListData = cartDataControl.get();

    orderList.textContent = "";
    orderCount.textContent = `(${orderListData.length})`;

    orderListData.forEach((item) => {
        orderList.append(createCartItem(item));
    });

    orderTotalPrice.textContent = `${orderListData.reduce((acc, item) => acc + +item.price, 0)} ₽`;

    orderForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!orderListData.length) {
            alert("Корзина пустая!");
            orderForm.reset();
            modalOrder.closeModal("close");
            return;
        }

        const data = getFormData(orderForm);
        const response = await fetch(`${API_URL}api/order`, {
            method: "POST",
            body: JSON.stringify({
                ...data,
                products: orderListData,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const { message } = await response.json();
        alert(message);

        cartDataControl.clear();
        orderForm.reset();
        modalOrder.closeModal("close");
    })
}

const init = async () => {
    //корзина
    // при нажатии на кнопку с классом header__btn-order, открывается элемент с классом modal_order
    modalController({
        modal: '.modal_order',
        btnOpen: '.header__btn-order',
        open: renderCart,
    });

    const { resetForm: resetFormMakeYourOwn } = calculateMakeYourOwwn();

    modalController({ modal: '.modal_make-your-own', btnOpen: '.cocktail__btn_make', close: resetFormMakeYourOwn, });

    const goodsListElem = document.querySelector(".goods__list");
    const data = await getData();
    // console.log(data);

    const cartsCocktail = data.map((item) => {
        const li = document.createElement('li');
        li.classList.add("goods__item");
        // li.textContent = item.title;
        li.append(createCard(item));
        return li;
    });
    goodsListElem.append(...cartsCocktail);


    const { fillInForm: fillInFormAdd, resetForm: resetFormAdd } = calculateAdd();

    modalController({
        modal: '.modal_add',
        btnOpen: '.cocktail__btn_add',

        open({ btn }) {
            const id = btn.dataset.id;
            // data - получаем с сервера
            const item = data.find(item => item.id.toString() === id);
            fillInFormAdd(item);
        },
        close: resetFormAdd,
    });
}

init();

