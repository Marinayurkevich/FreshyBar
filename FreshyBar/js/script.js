const API_URL = 'https://tall-chivalrous-impala.glitch.me/';


const getData = async () => {
    // const response = await fetch(API_URL + 'api/goods');
    const response = await fetch(`${API_URL}api/goods`);
    const data = await response.json();
    return data;
}

const createCard = (item) => {
    console.log(item);
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
                                <button class="btn cocktail__btn data-id="${item.id}"">Добавить</button>
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


const modalController = ({ modal, btnOpen, time }) => {
    const buttonElem = document.querySelector(btnOpen);
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
        if (target === modalElem || code === "Escape") {
            modalElem.style.opacity = 0;
            setTimeout(() => {
                modalElem.style.visibility = "hidden";
                scrollService.enabledScroll();
            }, time);
            window.removeEventListener('keydown', closeModal);
        }
    }

    const openModal = () => {
        modalElem.style.visibility = "visible";
        modalElem.style.opacity = 1;
        window.addEventListener('keydown', closeModal);
        scrollService.disabledScroll();
    };

    buttonElem.addEventListener('click', openModal);
    modalElem.addEventListener('click', closeModal);

    // возвращаем объект, т.к. если прсто перечислить функции, то вернется только последняя
    return { openModal, closeModal };
}




const init = async () => {
    //корзина
    // при нажатии на кнопку с классом header__btn-order, открывается элемент с классом modal_order
    modalController({ modal: '.modal_order', btnOpen: '.header__btn-order' });

    modalController({ modal: '.modal_make', btnOpen: '.cocktail__btn_make' });


    const goodsListElem = document.querySelector(".goods__list");
    const data = await getData();
    console.log(data);

    const cartsCocktail = data.map((item) => {
        const li = document.createElement('li');
        li.classList.add("goods__item");
        // li.textContent = item.title;
        li.append(createCard(item));
        return li;
    });

    goodsListElem.append(...cartsCocktail);
}

init();

