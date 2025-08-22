<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, onMounted, watch } from 'vue';
import { END_TIME, START_TIME, STEP_MINUTE } from '@/const/date';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { storeToRefs } from 'pinia';
import { useDateStore } from '@/store/userDateStore';
dayjs.extend(customParseFormat);



const { currentMonth, currentDay } = storeToRefs(useDateStore());
const generateTimeSlots = (start: string, end: string, step: number) => {
    const slots: string[] = [];
    let time = dayjs(start, 'HH:mm');
    const endTimeObj = dayjs(end, 'HH:mm');
    while (time.isBefore(endTimeObj)) {
        const from = time.format('HH:mm');
        slots.push(`${from}`);
        time = time.add(step, 'minute');
    }

    return slots;
};
watch(currentDay, (val, oldVal) => {
    console.log(val, oldVal)
})
onMounted(() => {

})
const timeSlots = computed(() => generateTimeSlots(START_TIME, END_TIME, STEP_MINUTE));
</script>

<template>
    <div>
        <v-chip v-for="time in timeSlots" :key="time" variant="outlined" color="primary" class="mr-2 mb-2">{{ time }}</v-chip>
    </div>
</template>

<style scoped></style>
