import {useState, useEffect} from 'react';
import {usePage} from '@inertiajs/react';

let translationsCache = {};
let languagesCache = [];
let currentLanguageCache = null;
let isInitialized = false;

export const useTranslation = () => {
    const page = usePage();
    const [currentLanguage, setCurrentLanguage] = useState(null);
    const [languages, setLanguages] = useState([]);
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        if (page.props.currentLanguage) {
            const langData = {
                code: page.props.currentLanguage.code,
                name: page.props.currentLanguage.name,
                nativeName: page.props.currentLanguage.native_name,
                flag: page.props.currentLanguage.flag
            };
            setCurrentLanguage(langData);
            currentLanguageCache = langData;
        }

        if (page.props.languages && page.props.languages.length > 0) {
            setLanguages(page.props.languages);
            languagesCache = page.props.languages;
        }

        if (page.props.translations) {
            translationsCache[currentLanguageCache?.code || 'en'] = page.props.translations;
        }

        if (!isInitialized && !page.props.currentLanguage) {
            loadFromCache();
        }

        isInitialized = true;
    }, [page.props]);

    const loadFromCache = () => {
        if (currentLanguageCache) {
            setCurrentLanguage(currentLanguageCache);
        }
        if (languagesCache.length > 0) {
            setLanguages(languagesCache);
        }
    };

    const t = (key, params = {}) => {
        if (page.props.translations && page.props.translations[key]) {
            let translation = page.props.translations[key];

            if (typeof translation === 'string' && Object.keys(params).length > 0) {
                return translation.replace(/\{(\w+)\}/g, (match, param) => {
                    return params[param] || match;
                });
            }

            return translation;
        }

        const langCode = currentLanguage?.code || 'en';
        const translation = translationsCache[langCode]?.[key] || translationsCache['en']?.[key] || key;

        if (typeof translation === 'string' && Object.keys(params).length > 0) {
            return translation.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] || match;
            });
        }

        return translation;
    };

    const changeLanguage = async (langCode) => {
        if (isChanging) return;

        const newLang = languages.find(lang => lang.code === langCode);
        if (!newLang) return;

        setIsChanging(true);

        try {
            setCurrentLanguage(newLang);
            currentLanguageCache = newLang;

            if (typeof window !== 'undefined') {
                localStorage.setItem('app-language', langCode);
            }

            const response = await fetch('/language/change', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': page.props.csrf_token,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({language: langCode})
            });

            if (response.ok) {
                window.location.reload();
            } else {
                throw new Error('Failed to change language');
            }
        } catch (error) {
            console.error('Language change error:', error);
            setIsChanging(false);
        }
    };

    return {
        t,
        currentLanguage: currentLanguage || {code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧'},
        languages: languages.length > 0 ? languages : [{
            code: 'en',
            name: 'English',
            nativeName: 'English',
            flag: '🇬🇧'
        }],
        changeLanguage,
        isChanging
    };
};
