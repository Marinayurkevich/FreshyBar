const API_URL = 'https://tall-chivalrous-impala.glitch.me/';


const getData = async () => {
    const response = await fetch(API_URL + 'api/goods');
    const data = await response.json();
    return data;

}
const init = async () => {
    const goodsListElem = document.querySelector(".goods__list");
    const data = await getData();
    console.log(data);

    const cartsCocktail = data.map((item) => {
        const li = document.createElement('li');
        li.classList.add("goods__item");
        li.textContent = item.title;
        return li;
        // console.log(li);
    });

    goodsListElem.append(...cartsCocktail);
}

init();

