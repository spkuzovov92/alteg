<script setup lang="ts">
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import ChipPicker from '@/components/DatePicker/ChipPicker.vue';
import { onMounted } from 'vue';
import { useDataStore } from '@/store/dataStore';
import { storeToRefs } from 'pinia';

const dataStore = useDataStore();
const { employees } = storeToRefs(dataStore);
onMounted(() => {
    if (!employees.value.length) dataStore.loadEmployees();
});
</script>

<template>
    <v-app>
        <v-layout>
            <v-main>
                <v-container>
                    <DatePicker />
                    <ChipPicker />
                </v-container>
            </v-main>
        </v-layout>
    </v-app>
</template>
