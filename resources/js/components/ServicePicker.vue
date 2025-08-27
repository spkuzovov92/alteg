<script setup lang="ts">
import { sendRequest } from '@/plugins/axios';
import { useDataStore } from '@/store/dataStore';
import { useDateStore } from '@/store/userDateStore';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { storeToRefs } from 'pinia';
import { computed, onMounted, Reactive, reactive, Ref, ref, watch } from 'vue';
import { useNotifier } from 'vuetify-notifier';

dayjs.extend(utc);
dayjs.extend(timezone);

const dataStore = useDataStore();
const { getDateToRequest } = storeToRefs(useDateStore());
const { userServices, mainData, servicesToTime, activeSlot } = storeToRefs(dataStore);
const activeGroup: Ref<null | number> = ref(null);

const filterSelectedServices = computed(() => userServices.value.filter((item) => item.staff_id));
const getLastData = computed(() => {
    const lastUserService = userServices.value.findLast((item) => item.staff_id);
    if (lastUserService) {
        let addMinute = 0;
        lastUserService.services.forEach((val) => {
            const duration = val.duration;
            addMinute += duration;
        });
        return dayjs(lastUserService.datetime).add(addMinute, 'minutes').format();
    } else return activeSlot.value?.attributes.datetime;
});
const getDataToFooter = computed(() => {
    let price = 0;
    let duration = 0;
    activeServices.forEach((item) => {
        const service = getServices.value.find((val: any) => val.id === item);
        if (service) {
            price += service.price_min;
            duration += getDuration(item);
        }
    });
    return {
        price,
        duration,
    };
});
const notifier = useNotifier();
const getGroups = computed(() => {
    let categories = mainData.value.services.category;
    categories = categories.filter((category: any) => !userServices.value.find((item) => item.category_id === category.id));
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
const activeServices: Reactive<Array<number>> = reactive([]);

const disabledService = (id: number) => {
    if (servicesToTime.value.find((item: any) => Number(item.id) === id)) {
        return false;
    }
    return true;
};
const getDuration = (id: number) => {
    const service = servicesToTime.value.find((item: any) => Number(item.id) === id);
    return service?.attributes.duration ? service.attributes.duration / 60 : 0;
};
const getServicesByUser = computed(() => userServices.value.find((item) => item.staff_id === null));
onMounted(() => {
    if (getServicesByUser.value) {
        activeGroup.value =
            mainData.value.services.services.find((item: any) => item.id === getServicesByUser.value?.services[0]).category_id || null;
        Object.assign(activeServices, getServicesByUser.value.services);
    } else if (getGroups.value.length === 1) activeGroup.value = getGroups.value[0].id;
    if(dayjs(activeSlot.value?.attributes.datetime).utc().valueOf() !== dayjs(getLastData.value).utc().valueOf()) {
        dataStore.loadServicesToTime()
    }
});
watch(activeGroup, () => {
    activeServices.splice(0, activeServices.length)
    const service = mainData.value.services.services.find((item: any) => item.category_id === activeGroup.value && item.title.includes('Подготовка'));
    if (service) activeServices.push(service.id);
});
const loadTimeSlots = async () => {
    try {
        const payload = {
            context: {
                location_id: Number(import.meta.env.VITE_ATLEG_ID),
            },
            filter: {
                date: getDateToRequest.value,
                records: [
                    {
                        attendance_service_items: activeServices.map((item: any) => {
                            return { type: 'service', id: item };
                        }),
                    },
                ],
            },
        };
        const resp = await sendRequest({ url: 'booking/search/timeslots', method: 'post', data: payload });
        if (resp.data.data) {
            const findDate = resp.data.data.find(
                (item: any) => getLastData.value === item.attributes.datetime || dayjs(item.attributes.datetime).utc().valueOf() === dayjs(getLastData.value).utc().valueOf(),
            );
            if (!findDate) {
                throw new Error('Нельзя добавить выбранную услугу');
            }
        }
    } catch (e: any) {
        if (e.message === 'Нельзя добавить выбранную услугу') {
            activeServices.splice(activeServices.length - 1, 1);
        }
        notifier.toast({
            text: e.message,
            type: 'error',
        });
    }
};
watch(activeServices, () => {
    loadTimeSlots();
});
const changeActiveServices = (id: number) => {
    if (!activeServices.includes(id)) activeServices.push(id);
    else activeServices.splice(activeServices.indexOf(id), 1);
};
const addServicesToUser = () => {
    if (getServicesByUser.value) {
        const index = userServices.value.indexOf(getServicesByUser.value);
        if (index !== -1) {
            userServices.value.splice(index, 1);
        }
    }
    userServices.value.push({
        services: activeServices.map((item) => ({ id: item, duration: getDuration(item) })),
        staff_id: null,
        datetime: getLastData.value as string,
        category_id: activeGroup.value as number,
    });
    dataStore.changeActiveStep(3);
};
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
            <v-card
                @click="changeActiveServices(service.id)"
                class="mb-4"
                v-for="service in getServices"
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
    <div class="pt-4">
        <v-row>
            <v-col cols="3" class="text-h6">Итого:</v-col>
            <v-col cols="3" class="text-h6"> {{ getDataToFooter.price }} ฿</v-col>
            <v-col cols="3" class="text-h6">{{ getDataToFooter.duration }} минут</v-col>
            <v-col cols="3">
                <v-btn color="primary" v-if="getDataToFooter.price > 0" @click="addServicesToUser">Выбрать специалиста </v-btn>
                <v-btn color="primary" v-if="filterSelectedServices.length" @click="dataStore.changeActiveStep(4)"> Оформить заказ </v-btn>
            </v-col>
        </v-row>
    </div>
</template>

<style scoped></style>
