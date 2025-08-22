<script setup lang="ts">
import { sendRequest } from '@/plugins/axios';
import { useDataStore } from '@/store/dataStore';
import { useDateStore } from '@/store/userDateStore';
import { storeToRefs } from 'pinia';
import { computed, onMounted, Ref, ref, watch } from 'vue';

const dataStore = useDataStore();
const { getDateToRequest } = storeToRefs(useDateStore());
const { userServices, mainData, servicesToTime } = storeToRefs(dataStore);
const activeGroup: Ref<null | string> = ref(null);


const getLastData = computed(() => {
    if(!userServices.value.length) {
        return getDateToRequest.value
    }
    return null
})
const getGroups = computed(() => {
    let categories = mainData.value.services.category;
    categories = categories.filter((category: any) => {
        const services = mainData.value.services.services;
        const servicesToCategory = services.filter((service: any) => service.category_id === category.id);

        return servicesToCategory.filter(
            (service: any) => servicesToTime.value.find((item) => Number(item.id) === service.id) && !service.title.includes('Подготовка'),
        ).length;
    });
    return categories;
});
const getServices = computed(() => {
    const services = mainData.value.services.services;
    return services.filter(
        (item: any) =>
            item.category_id === activeGroup.value &&
            !item.title.includes('Подготовка') &&
            servicesToTime.value.find((val: any) => Number(val.id) === Number(item.id)),
    );
});
const activeServices: Ref<{ items: Array<number> }> = ref({ items: [] });

const disabledService = (id: number) => {
    if (servicesToTime.value.find((item: any) => Number(item.id) === id)) {
        return false;
    }
    return true;
};
onMounted(() => {
    if (getGroups.value.length === 1) activeGroup.value = getGroups.value[0].id;
});
watch(activeGroup, () => {
    const service = mainData.value.services.services.find((item: any) => item.category_id === activeGroup.value && item.title.includes('Подготовка'));
    if (service) {
        activeServices.value.items.push(service.id);
    }
});
const loadTimeSlots = async () => {
    const payload = {
        context: {
            location_id: Number(import.meta.env.VITE_ATLEG_ID),
        },
        filter: {
            date: getDateToRequest.value,
            records: [
                {
                    attendance_service_items: activeServices.value.items.map((item: any) => {
                        return { type: 'service', id: item };
                    }),
                },
            ],
        },
    };
    const resp = await sendRequest({ url: 'booking/search/timeslots', method: 'post', data: payload });
    console.log(resp);
};
watch(activeServices.value.items, () => {
    loadTimeSlots();
});
</script>

<template>
    <div class="pt-4">
        <div>
            <h5 class="text-h5 pb-4">Выберите группу</h5>
            <div>
                <v-chip
                    :variant="activeGroup && activeGroup === category.id ? 'elevated' : 'outlined'"
                    color="primary"
                    class="mr-2 mb-2"
                    size="large"
                    @click="activeGroup = category.id"
                    v-for="category in getGroups"
                    :key="category.id"
                    >{{ category.title }}
                </v-chip>
            </div>
        </div>
        <div class="pt-2" v-if="activeGroup">
            <h5 class="text-h5 pb-4">Выберите услуги</h5>
            <v-card class="mb-4" v-for="service in getServices" :key="service.id" :disabled="disabledService(service.id)" :title="service.title">
                <template #append>
                    <v-checkbox v-model="activeServices.items" :value="service.id" multiple :disabled="disabledService(service.id)" />
                </template>
                <v-card-text>
                    <p class="text-h6">{{ service.price_max }} ฿</p>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<style scoped></style>
