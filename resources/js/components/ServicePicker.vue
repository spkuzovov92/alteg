<script setup lang="ts">
import { sendRequest } from '@/plugins/axios';
import { useDataStore } from '@/store/dataStore';
import { useDateStore } from '@/store/userDateStore';
import { storeToRefs } from 'pinia';
import { computed, Reactive, reactive, ref, Ref, watch } from 'vue';
import dayjs from 'dayjs';

const dataStore = useDataStore();
const { getDateToRequest } = storeToRefs(useDateStore());
const { mainData, servicesToTime, activeSlot } = storeToRefs(dataStore);
const lastService: Ref<number | null> = ref(null);

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

const activeServices: Reactive<Array<number>> = reactive([]);

const disabledService = (id: number) => {
    if (servicesToTime.value.find((item: any) => Number(item.id) === id)) {
        return false;
    }
    return true;
};
const getServicesByGroup = computed(() => {
    return getGroups.value.map((category: any) => {
        return {
            ...category,
            childs: mainData.value.services.services.filter(
                (item: any) =>
                    item.category_id === category.id &&
                    !item.title.includes('Подготовка') &&
                    servicesToTime.value.find((val: any) => Number(val.id) === Number(item.id)),
            ),
        };
    });
});
const getDuration = (id: number) => {
    const service = servicesToTime.value.find((item: any) => Number(item.id) === id);
    return service?.attributes.duration ? service.attributes.duration / 60 : 0;
};
const getActiveServicesByGroup = computed(() => {
    const services: Array<{ category_id: number; items: Array<number> }> = [];
    activeServices.forEach((item: any) => {
        const service = mainData.value.services.services.find((val: any) => val.id === item);
        if (service) {
            if (!services.find((val: any) => val.category_id === service.category_id))
                services.push({
                    category_id: service.category_id,
                    items: [],
                });
            const index = services.findIndex((val: any) => val.category_id === service.category_id);
            services[index].items.push(service.id);
        }
    });
    services.forEach((service) => {
        const serviceLoad = mainData.value.services.services.find(
            (item: any) => item.category_id === service.category_id && item.title === 'Подготовка',
        );
        if (serviceLoad) service.items.push(serviceLoad.id);
    });
    return services;
});
const loadTimeSlots = async () => {
    let addDurationToStart = 0
    let findTime = dataStore.activeSlot?.attributes.datetime
    for (const item of getActiveServicesByGroup.value) {
        const payload = {
            context: {
                location_id: Number(import.meta.env.VITE_ATLEG_ID),
            },
            filter: {
                date: getDateToRequest.value,
                records: [
                    {
                        attendance_service_items: item.items.map((item: any) => {
                            return { type: 'service', id: item };
                        }),
                    },
                ],
            },
        };
        const resp = await sendRequest({ url: 'booking/search/timeslots', method: 'post', data: payload });
        console.log(findTime)
        for(const val of item.items) {
            addDurationToStart+=getDuration(val)
            console.log(addDurationToStart)

        }
        console.log(resp);
    }

};
watch(activeServices, () => {
    loadTimeSlots();
});

const changeActiveServices = (id: number) => {
    if (!activeServices.includes(id)) activeServices.push(id);
    else activeServices.splice(activeServices.indexOf(id), 1);
};
</script>

<template>
    <div class="pt-4">
        <div>
            <h3 class="text-h3 pb-4">Выберите услуги</h3>
            <div v-for="category in getServicesByGroup" :key="category.id">
                <h5 class="text-h5 text-bold pb-4">{{ category.title }}</h5>
                <v-card
                    @click="changeActiveServices(service.id)"
                    class="mb-4"
                    v-for="service in category.childs"
                    :key="service.id"
                    :disabled="disabledService(service.id)"
                    :title="service.title"
                >
                    <template #append>
                        <v-checkbox v-model="activeServices" :value="service.id" multiple :disabled="disabledService(service.id)" />
                    </template>
                    <v-card-text>
                        <v-row>
                            <v-col cols="6" class="text-h6"> {{ service.price_max }} ฿</v-col>
                            <v-col cols="6" class="text-h6 text-right">{{ getDuration(service.id) }} минут</v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
