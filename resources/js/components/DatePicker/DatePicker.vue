<script setup lang="ts">
import { useDateStore } from '@/store/userDateStore';
import dayjs from 'dayjs';
import localeData from 'dayjs/plugin/localeData';
import 'dayjs/locale/ru';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { da } from 'vuetify/locale';

dayjs.extend(localeData);
dayjs.locale('ru');

const dateStore = useDateStore();

const { currentMonth, currentDay } = storeToRefs(dateStore);
const { changeCurrentMonth, changeCurrentDay, dayWeekRange } = dateStore;

const month = dayjs.months();

const getCurrentMonth = computed(() => {
    const s = dayjs().month(currentMonth.value).format('MMMM YYYY');
    return String(s[0]).toUpperCase() + String(s).slice(1);
});

const setMonth = (val: string | null) => {
    changeCurrentMonth(val ? month.indexOf(val) : 0);
};
const setNextMonth = () => {
    changeCurrentMonth(currentMonth.value + 1);
};
const setPrevMonth = () => {
    changeCurrentMonth(currentMonth.value - 1);
};

const setCurrentDay = (day: number) => {
    changeCurrentDay(day);
};
const getMinMonth = computed(() => Number(dayjs().format('M')));

const isFirstMonth = computed(() => currentMonth.value < getMinMonth.value);

// --- Генерация дат для календаря ---
const daysInMonth = computed(() => dayjs().month(currentMonth.value).daysInMonth());

// Функция для создания матрицы дат, начиная с понедельника
const calendarMatrix = computed(() => {
    const firstDay = dayjs().month(currentMonth.value).date(1);
    const firstWeekday = firstDay.day(); // 0 = Sunday, 1 = Monday ...
    const startOffset = (firstWeekday + 6) % 7; // смещаем так, чтобы неделя начиналась с понедельника

    const totalDays = daysInMonth.value;
    const weeks: number[][] = [];
    let week: (number | null | any)[] = Array(7).fill(null);

    for (let i = 0; i < startOffset; i++) {
        week[i] = null;
    }

    for (let day = 1; day <= totalDays; day++) {
        const index = (startOffset + day - 1) % 7;
        week[index] = day;

        if (index === 6 || day === totalDays) {
            weeks.push([...week]);
            week = Array(7).fill(null);
        }
    }

    return weeks;
});
const disabledDay = (day: number) => {
    if (dayjs().month(currentMonth.value).format('MM') === dayjs().format('MM')) {
        return day < Number(dayjs().format('D'));
    }
    return false;
};
</script>

<template>
    <div>
        <v-row>
            <v-col cols="4">
                <v-chip variant="outlined" color="primary" class="month-chip">{{ getCurrentMonth }}</v-chip>
            </v-col>
            <v-col cols="2" offset="6" class="align-center">
                <v-btn icon="mdi-chevron-left" :disabled="isFirstMonth" @click="setPrevMonth" class="mr-1" />
                <v-btn icon="mdi-chevron-right" @click="setNextMonth" class="ml-1" />
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-table>
                    <thead>
                        <tr>
                            <th v-for="item in dayWeekRange" :key="item">{{ item }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(week, i) in calendarMatrix" :key="i">
                            <td v-for="(day, j) in week" :key="j" class="text-center">
                                <template v-if="day">
                                    <v-chip
                                        :disabled="disabledDay(day)"
                                        :color="currentDay === day ? 'primary' : '#000'"
                                        @click="setCurrentDay(day)"
                                        :variant="currentDay === day ? 'outlined' : 'text'"
                                    >
                                        {{ day || '' }}
                                    </v-chip>
                                </template>
                            </td>
                        </tr>
                    </tbody>
                </v-table>
            </v-col>
        </v-row>
    </div>
</template>

<style></style>
