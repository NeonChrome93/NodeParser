const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeProduct(url, region) {
    // Запуск браузера и новой страницы
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-blink-features=AutomationControlled'],
    })
    const page = await browser.newPage()

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    await page.setViewport({width: 1920, height: 1080})
    await page.goto(url)
    await page.waitForSelector('div[class^="ProductPage_informationBlock__"]', {timeout: 3000})


    const regionTextElement = await page.$('div[class^="Region_region"]')

    const productName = url.match(/\/product\/([^\/]+)/)[1];

    console.log('region', regionTextElement)
    await regionTextElement.click()

    const buttons = await page.$$('li[class^="UiRegionListBase_item"]') //.find(elem => elem.textContent === region
    for (const button of buttons) {
        const text = await page.evaluate(el => el.textContent, button);

        if (text.trim() === region) {
            console.log('Найденный элемент:', text);
            await button.click();
            break;
        }
    }
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, 3000)
    })

    const modalCloseButton = await page.$('button[class^="Tooltip_closeIcon"]')
    await modalCloseButton.click()


    await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    });
    const cookieAgreeButton = await page.$('div[class^="CookiesAlert_agreeButton"]')
    await cookieAgreeButton.click()

    await page.setViewport({
        width: 2500, // Ширина страницы
        height: 4000, // Высота страницы
    });
    const screenshot = await page.screenshot({path: `${productName}-${region}.jpg`, fullPage: false});
    console.log(screenshot, " screenshot")
    fs.writeFileSync("./screenshots/screenshot.jpg", screenshot,)


    const priceOldSpan = await page.$('[class*="Price_role_old"]')
    const priceOld = await (await priceOldSpan.getProperty('textContent')).jsonValue()

    let priceDiscount
    let priceCurrent
    let rating
    let  reviewCount
    if (priceOldSpan){
        const priceDiscountSpan = await page.$('[class*="Price_role_discount"]')
         priceDiscount = await (await priceDiscountSpan.getProperty('textContent')).jsonValue()
    } else {
        const priceCurrentSpan = await page.$('span[class*="Price_role_regular"]');
        priceCurrent = await (await priceCurrentSpan.getProperty('textContent')).jsonValue()
    }
    let ratingClass = await page.$('[class^="ActionsRow_stars"]')
    rating = await (await ratingClass.getProperty('textContent')).jsonValue()
    let reviewCountClass = await page.$('[class^="ActionsRow_reviews"]:not([class*="ActionsRow_reviewsWrapper"]')
    reviewCount = await (await reviewCountClass.getProperty('textContent')).jsonValue()


    const productInfo = {
        priceOld,
        priceCurrent,
        priceDiscount,
         rating,
         reviewCount
    };


    const productData = `
    price: ${productInfo.priceOld.split(" ")[0] || productInfo.priceCurrent.split(" ")[0] }
    priceDiscount: ${productInfo.priceDiscount.split(" ")[0] || 'Нет скидочной цены'}
     rating: ${productInfo.rating}
     reviewCount: ${productInfo.reviewCount.split(" ")[0]}
    `;
    //console.log(productData, " productData")

    fs.writeFileSync('product.txt', productData.trim());

    // Закрытие браузера
    await browser.close();
}

const url = process.argv[2];
const region = process.argv[3];

console.log(url)
console.log(region)

// Запуск скрипта
scrapeProduct(url, region)
    .then(() => console.log('Готово!'))
    .catch(error => console.error('Ошибка:', error));