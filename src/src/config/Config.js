var Localize = require('localize');
var Locales = require('../locales/translations.js');

var conf = {
    master_key: 'GAWIB7ETYGSWULO4VB7D6S42YLPGIC7TY7Y2SSJKVOTMQXV5TILYWBUA',
    horizon_host: 'http://blockchain.smartmoney.com.ua/',
    assets_url: 'assets',
    keyserver_host: 'http://keys.smartmoney.com.ua',
    keyserver_v_url: '/v2/wallets',
    api_host: 'http://api.smartmoney.com.ua'
};

conf.phone = {
    view_mask:  "+99 (999) 999-99-99",
    db_mask:    "999999999999",
    length:     10,
    prefix:     "+38"
}

conf.horizon = new StellarSdk.Server(conf.horizon_host);
conf.locales = Locales;

conf.payments = {
    onpage: 10
}

conf.loc = new Localize(conf.locales);
conf.loc.throwOnMissingTranslation(false);
/*****/ var locale = (typeof navigator.language != 'undefined') ? navigator.language.substring(0,2) : "uk";
/*****/ conf.loc.setLocale(locale);
conf.tr = conf.loc.translate; //short alias for translation

var Config = module.exports = conf;