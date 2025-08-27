<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useDataStore } from '@/store/dataStore';
import { computed } from 'vue';

const { mainData, activeStep } = storeToRefs(useDataStore());

const getLogo = computed(() => mainData.value.logo);
</script>

<template>
    <div>
        <v-row class="align-center">
            <v-col  cols="1">
                <v-btn v-if="activeStep !== 1" @click="useDataStore().changeActiveStep(activeStep === 4 ? activeStep - 2 : activeStep - 1)" :icon="'mdi-chevron-left'"/>
            </v-col>
            <v-col cols="6" md="4">
                <v-img  :src="getLogo" :width="64" />
            </v-col>
        </v-row>
    </div>
</template>

<style scoped></style>
