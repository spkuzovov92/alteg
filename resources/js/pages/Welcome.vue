<script setup lang="ts">
import DatePicker from '@/components/DatePicker/DatePicker.vue';
import ChipPicker from '@/components/DatePicker/ChipPicker.vue';
import { useDataStore } from '@/store/dataStore';
import { storeToRefs } from 'pinia';
import { useDateStore } from '@/store/userDateStore';
import { onMounted } from 'vue';
import MainHeader from '@/components/MainHeader.vue';
import ServicePicker from '@/components/ServicePicker.vue';

const dataStore = useDataStore()
const {activeStep, loading} = storeToRefs(dataStore)
onMounted(() => dataStore.loadMainData())
</script>

<template>
    <v-app>
        <v-layout>
            <v-main>
                <v-container>
                    <div class="text-center" v-if="loading">
                        <v-progress-circular indeterminate color="primary"/>
                    </div>
                    <template v-else>
                        <main-header/>
                        <template v-if="activeStep === 1">
                            <DatePicker />
                            <ChipPicker />
                        </template>
                        <template v-else-if="activeStep === 2">
                            <service-picker/>
                        </template>
                    </template>

                </v-container>
            </v-main>
        </v-layout>
    </v-app>
</template>
