<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, onMounted, watch } from 'vue';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { storeToRefs } from 'pinia';
import { useDateStore } from '@/store/userDateStore';
import { useDataStore } from '@/store/dataStore';

dayjs.extend(customParseFormat);
const dataStore = useDataStore();
const { slots, loadingSlots, activeSlot } = storeToRefs(dataStore);
const { currentDay, getDateToRequest } = storeToRefs(useDateStore());
watch(currentDay, () => {
    dataStore.loadSlots(getDateToRequest.value);
});
watch(activeSlot, () => {
    dataStore.loadServicesToTime()
})
onMounted(() => {
    if (!slots.value.length) dataStore.loadSlots(getDateToRequest.value);
});
</script>

<template>
    <div>
        <div class="text-center" v-if="loadingSlots">
            <v-progress-circular  indeterminate color="primary" />
        </div>
        <v-chip
            size="large"
            @click="dataStore.changeActiveSlot(time)"
            v-else
            v-for="time in slots"
            :key="time.id"
            :variant="activeSlot && activeSlot.id === time.id ? 'elevated' : 'outlined'"
            color="primary"
            class="mr-2 mb-2"
            >{{ time.attributes.time }}
        </v-chip>
        <div class="text-center" v-if="activeSlot">
            <v-btn  @click="dataStore.changeActiveStep(2)" color="primary">Продолжить</v-btn>
        </div>
    </div>
</template>

<style scoped></style>
