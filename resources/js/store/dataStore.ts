import { sendRequest } from '@/plugins/axios';
import { defineStore } from 'pinia';
import { Reactive, reactive, Ref, ref } from 'vue';

const companyId = import.meta.env.VITE_ATLEG_ID;
type slotType = {
    id: string;
    type: string;
    attributes: {
        datetime: string;
        is_bookable: boolean;
        time: string;
    };
};
type servicesToTimeType = {
    attributes: {
        bookable_status: string;
        duration: number;
        is_bookable: boolean;
        price_max: number;
        price_min: number;
    };
    id: string;
    type: string;
};
type userServiceType = {
    datetime: string;
    staff_id: number | null;
    services: Array<{ id: number, duration: number }>;
    category_id: number;
};

export const useDataStore = defineStore('data', () => {
    const userServices: Array<userServiceType> = reactive([])
    const loading = ref(false);
    const slots: Reactive<Array<slotType>> = reactive([]);
    const activeSlot: Ref<slotType | null> = ref(null);
    const activeStep = ref(1);
    const mainData: Reactive<any> = reactive({ services: {}, staff: [] });
    const servicesToTime: Reactive<Array<servicesToTimeType>> = reactive([]);
    const loadingServices = ref(false);
    const loadingSlots: Ref<boolean> = ref(false);
    const data = reactive([]);
    const items: Reactive<Array<{ id: number; name: string }>> = reactive([]);

    const loadSlots = async (date: string) => {
        loadingSlots.value = true;
        Object.assign(slots, []);
        try {
            const payload = {
                context: {
                    location_id: Number(companyId),
                },
                filter: {
                    date,
                    records: [
                        {
                            attendance_service_items: items.map((item) => {
                                return {
                                    type: 'service',
                                    id: item.id,
                                };
                            }),
                        },
                    ],
                },
            };
            const resp = await sendRequest({ url: 'booking/search/timeslots', method: 'post', data: payload });
            if (resp.data) {
                resp.data.data.forEach((item: any) => {
                    slots.push(item);
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            loadingSlots.value = false;
        }
    };

    const loadServicesToTime = async (datetime?: string) => {
        if (!activeSlot.value) return;
        loadingServices.value = true;
        Object.assign(servicesToTime, []);

        try {
            const payload = {
                context: {
                    location_id: Number(companyId),
                },
                filter: {
                    datetime: datetime || activeSlot.value.attributes.datetime,
                    records: [
                        {
                            attendance_service_items: [],
                        },
                    ],
                },
            };
            const resp = await sendRequest({ url: 'booking/search/services', data: payload, method: 'post' });
            if (resp.data.data) {
                resp.data.data.forEach((item: any) => {
                    servicesToTime.push(item);
                });
            }
        } catch (e) {
            console.log(e);
        } finally {
            loadingServices.value = false;
        }
    };

    const changeActiveSlot = (val: slotType) => {
        activeSlot.value = val;
    };

    const loadMainData = async () => {
        loading.value = true;
        try {
            let resp = await sendRequest({ url: `company/${companyId}` });
            if (resp.data.data) Object.assign(mainData, { ...mainData, ...resp.data.data });
            resp = await sendRequest({ url: `book_services/${companyId}` });
            if (resp.data.data) mainData.services = resp.data.data;
            resp = await sendRequest({url: `book_staff/${companyId}`})
            if(resp.data.data) mainData.staff = resp.data.data
        } catch (e) {
            console.log(e);
        } finally {
            loading.value = false;
        }
    };

    const changeActiveStep = (val: number) => {
        activeStep.value = val
    }
    const changeUserService = (data: any) => {
        Object.assign(userServices, data);
    }
    const changeStaffId = (index: number, id: number) => {
        userServices[index].staff_id = id
    }

    return {
        loadSlots,
        data,
        slots,
        activeSlot,
        loadingSlots,
        activeStep,
        changeActiveSlot,
        loadingServices,
        mainData,
        loadServicesToTime,
        loading,
        loadMainData,
        changeActiveStep,
        userServices,
        servicesToTime,
        changeUserService,
        changeStaffId
    };
});
