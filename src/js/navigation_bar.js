const currentLang = document.getElementById('current-lang');
const langList = document.getElementById('lang-list');

function deleteLang(selectedLang) {
    langList.querySelectorAll('li').forEach(li => {
        li.style.display = li.dataset.lang === selectedLang ? 'none' : 'block';
    });
}

deleteLang('ENG');

currentLang.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    langList.style.display = langList.style.display === 'block' ? 'none' : 'block';
});

langList.querySelectorAll('li').forEach(li =>{
    li.addEventListener('click', (e) =>{
        e.stopPropagation();
    const lang = li.dataset.lang;
    const src = li.dataset.src;
    currentLang.innerHTML = `<img src="${src}" class="icon-flag"> ${lang}`;
    langList.style.display = 'none';
    deleteLang(lang);
 });

});
 document.addEventListener('click', (e) => {
    if (!currentLang.contains(e.target) && !langList.contains(e.target)) {
        langList.style.display = 'none';
    }
});



$(".menu > ul > li").click(function (e) {
    $(this).siblings().removeClass("active");
    $(this).toggleClass("active");
    $(this).find("ul").slideToggle();
    $(this).siblings().find("ul").slideUp();
    $(this).siblings().find("ul").find("li").removeClass("active");
});

$(".menu-btn").click(function (){
    $(".left-panel").toggleClass("active");
});