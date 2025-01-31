/**
 * @module initSettingsPage
 * @desc وحدة تهيئة صفحة الإعدادات
 * @exports initSettingsPage
 */

import getGPS from './modules/getGPS.js';
import error_handling from './modules/error_handling.js';

/**
 * القيم الافتراضية للإعدادات
 * @constant {Object}
 */
const DEFAULT_VALUES = {
    Calculation_settings: 'UmmAlQura',
    Shafaq_settings: 'General',
    madhab_settings: 'Shafi',
    notifications_adhan: true,
    longitude_settings: null,
    latitude_settings: null,
    timezone_settings: null,
    fajr_settings: 0,
    sunrise_settings: 0,
    dhuhr_settings: 0,
    asr_settings: 0,
    maghrib_settings: 0,
    isha_settings: 0,
};

let themes

/**
 * الحصول على عنصر DOM باستخدام معرف العنصر
 * @function
 * @param {string} id - معرف العنصر
 * @returns {HTMLElement} - عنصر DOM
 */
const getElementById = (id) => document.getElementById(id);

/**
 * تعيين القيم الافتراضية للإعدادات
 * @function
 */
const setDefaultValues = () => {
    const storage = window.localStorage;

    Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
        const element = getElementById(key);

        if (element) {
            const storedValue = storage.getItem(key);

            if (key === 'Calculation_settings' || key === 'Shafaq_settings' || key === 'madhab_settings') {
                // ابحث عن العنصر المناسب في select وقم بتحديد الخيار المناسب
                const option = element.querySelector(`option[value="${storedValue || value}"]`);
                if (option) {
                    option.selected = true;
                }
            } else if (key === 'notifications_adhan') {
                element.checked = storedValue !== null && storedValue !== undefined ? bool(storedValue) : true;
            } else if (key === 'longitude_settings' || key === 'latitude_settings') {
                const longitudeValue = storage.getItem('longitude_settings');
                const latitudeValue = storage.getItem('latitude_settings');
                if (longitudeValue && latitudeValue) {
                    element.value = key === 'longitude_settings' ? longitudeValue : latitudeValue;
                }
            } else if (key === 'timezone_settings') {
                const timezoneValue = storage.getItem('timezone_settings');

                if (timezoneValue) {
                    element.value = timezoneValue;
                }
            } else {
                element.value = storedValue !== null && storedValue !== undefined ? Number(storedValue) : value;
            }
        }
    });
};

/**
 * التعامل مع تحديث الموقع
 * @function
 */
const handleRefreshLocation = async () => {
    try {
        const statusPERM = await permissionStatus();

        if (statusPERM) {
            const { latitude, longitude, timezone } = await getGPS();
            const storage = window.localStorage;

            storage.setItem('latitude_settings', latitude);
            storage.setItem('longitude_settings', longitude);
            storage.setItem('timezone_settings', timezone);

            const alertEl = getElementById('alert');
            if (alertEl) {
                alertEl.style.display = 'block';

                setTimeout(() => {
                    alertEl.style.display = 'none';
                    window.location.href = '/pages/settings.html';
                }, 1000);
            }
        } else {
            const textAlert = getElementById('text_alert');
            const alertEl = getElementById('alert');

            if (textAlert && alertEl) {
                textAlert.innerText =
                    'الرجاء السماح بالوصول الى الموقع الجغرافي او قم بإدخال الإحداثيات بشكل يدوي';
                alertEl.style.display = 'block';

                setTimeout(() => {
                    alertEl.style.display = 'none';
                    window.location.href = '/pages/settings.html';
                }, 3000);
            }
        }

    } catch (error) {
        error_handling(error);
    }
};

/**
 * التعامل مع حفظ الإعدادات
 * @function
 */
const handleSaveSettings = () => {
    const storage = window.localStorage;
    const themeStorage = storage.getItem("themeStorage");

    Object.entries(DEFAULT_VALUES).forEach(([key]) => {
        const element = getElementById(key);
        if (element) {

            if (key === 'notifications_adhan') {
                storage.setItem(key, element.checked);
            } else {
                storage.setItem(key, element.value);
            }
        }
    });

    const alertEl = getElementById('alert');
    if (alertEl) {
        alertEl.style.display = 'block';

        setTimeout(() => {
            alertEl.style.display = 'none';
            window.location.href = '/pages/settings.html';
        }, 1000);
    }

    if (themes) {
        storage.setItem("themeStorage", themes);
    }

    if (!themes && !themeStorage) {
        storage.setItem("themeStorage", "theme_1");
    }

    if (!themes && themeStorage) {
        storage.setItem("themeStorage", themeStorage);
    }


};

/**
 * تحويل القيمة إلى قيمة منطقية
 * @function
 * @param {string} v - القيمة الأصلية
 * @returns {boolean} - القيمة المنطقية
 */
function bool(v = '') {
    return !['false', 'null', 'NaN', 'undefined', '0'].includes(v);
}

/**
 * التحقق من حالة إذن الوصول إلى الموقع
 * @function
 * @returns {Promise<boolean>} - الوعد بقيمة منطقية تمثل حالة إذن الوصول
 */
async function permissionStatus() {
    return new Promise((resolve) => {
        const permissions = cordova?.plugins?.permissions;
        permissions?.hasPermission(permissions?.ACCESS_COARSE_LOCATION, (status) => {
            resolve(status.hasPermission);
        });
    });
}

/**
 * تصدير الوحدة
 */
export default async () => {
    if (window.location.pathname === '/pages/settings.html') {
        try {
            setDefaultValues();

            const back = getElementById('back');
            const storage = window.localStorage;
            const themeStorage = storage.getItem("themeStorage");
            const refreshLocation = getElementById('refresh_location');
            const saveSettings = getElementById('settings_save');


            if (back) {
                back.addEventListener('click', () => {
                    window.location.href = '/more.html';
                });
            }

            if (refreshLocation) {
                refreshLocation.addEventListener('click', handleRefreshLocation);
            }

            if (saveSettings) {
                saveSettings.addEventListener('click', handleSaveSettings);
            }

            const themeParagraphs = document.querySelectorAll('#themes p');
            themeParagraphs.forEach(paragraph => {
                paragraph.addEventListener('click', () => {
                    themeParagraphs.forEach(p => {
                        p.style.border = 'none';
                    });
                    console.log(paragraph.id);
                    themes = paragraph.id
                    document.getElementById(paragraph.id).style = "border-style: solid;  border-width: 1px; border-color: var(--background_div_hover);"
                });
            });

            if (themeStorage) {
                document.getElementById(themeStorage).style = "border-style: solid;  border-width: 1px; border-color: var(--background_div_hover);"
            }

        } catch (error) {
            error_handling(error);
        }
    }

};