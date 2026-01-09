import { getLangNameFromCode } from 'language-name-map';
import en from '../../translations/en.json';
import es from '../../translations/es.json';
import { navigatorConfig } from '../utils';
// import mn from '../../translations/mn.json';
import I18n from 'react-native-i18n';

export const translations = {
    en,
    es,
    // mn,
};

export function getAvailableLocales() {
    const availableLocales = navigatorConfig('availableLocales', ['es']);
    return Object.fromEntries(Object.entries(translations).filter(([locale]) => availableLocales.includes(locale)));
}

export function getLocale() {
    //return getString('_locale') ?? navigatorConfig('defaultLocale', 'es');
    return navigatorConfig('defaultLocale', 'es');
}

export function getLanguage() {
    const locale = getLocale();
    return { code: locale, ...getLangNameFromCode(locale) };
}

export function translate(key, options) {
    return I18n.t(key, options);
}
