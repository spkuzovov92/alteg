import { defineStore } from 'pinia';
import { computed, Ref, ref } from 'vue';
import dayjs from 'dayjs';

export const useDateStore = defineStore('date', () => {
    const currentDate = new Date();
    const currentMonth = ref(currentDate.getMonth());
    const currentDay = ref(currentDate.getDate());
    const startTIme: Ref<string | null> = ref(null);
    const dayWeekRange = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const changeCurrentMonth = (val: number) => {
        currentMonth.value = val;
        currentDay.value = 1;
    };
    const changeCurrentDay = (val: number ) => {
        currentDay.value = val;
    };
    const changeStartTime = (val: string | null) => {
        startTIme.value = val;
    };
    const getDateToRequest = computed(() =>
        dayjs().set('month', currentMonth.value).set('date', currentDay.value).format('YYYY-MM-DD')
    )
    return { currentMonth, currentDay, dayWeekRange, changeCurrentDay, changeCurrentMonth, startTIme, changeStartTime, getDateToRequest };
});
