import { defineStore } from 'pinia';
import { Ref, ref } from 'vue';

export const useDateStore = defineStore('date', () => {
    const currentDate = new Date();
    const currentMonth = ref(currentDate.getMonth());
    const currentDay: Ref<number | null> = ref(currentDate.getDate());
    const startTIme: Ref<string | null> = ref(null);
    const dayWeekRange = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const changeCurrentMonth = (val: number) => {
        currentMonth.value = val;
        currentDay.value = null;
    };
    const changeCurrentDay = (val: number | null) => {
        currentDay.value = val;
    };
    const changeStartTime = (val: string | null) => {
        startTIme.value = val;
    };
    return { currentMonth, currentDay, dayWeekRange, changeCurrentDay, changeCurrentMonth, startTIme, changeStartTime };
});
