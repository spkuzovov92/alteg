<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useDataStore } from '@/store/dataStore';
import { sendRequest } from '@/plugins/axios';
import dayjs from 'dayjs';

const storeData = useDataStore();

const valid = ref(false);
const form = reactive({
    fullname: '',
    email: '',
    comment: '',
    phone: '',
    last_name: '',
    notify_by_sms: false,
});

const emailRules = [
    (value: string | null) => {
        if (value) return true;

        return 'E-mail is required.';
    },
    (value: string) => {
        if (/.+@.+\..+/.test(value)) return true;

        return 'E-mail must be valid.';
    },
];
const required = [
    (value: string | null) => {
        if (value) return true;

        return 'Is required.';
    },
];
const getSum = computed(() => {
    let sum = 0;
    const services = storeData.mainData.services.services;
    const userServices = storeData.userServices;
    userServices.forEach((items) =>
        items.services.forEach((item) => {
            const service = services.find((val: any) => val.id === item.id);
            if (service) {
                sum += service.price_max;
            }
        }),
    );
    return sum;
});

const sendForm = async () => {
    const payload = {
        ...form,
        appointments: [],
        // bookform_id: 1362871,
        // appointments_charges: [{ id: 0, services: [], prepaid: [] }],

    };
    let index = 0
    for (const item of storeData.userServices) {
        //@ts-ignore
        payload.appointments.push({
            datetime: dayjs(item.datetime).format('YYYY-MM-DDTHH:mm:ss'),
            staff_id: item.staff_id,
            services: item.services.map((val) => val.id),
            id: index
        });
        index++
    }
    const resp = await sendRequest({
        url: `book_record/${import.meta.env.VITE_ATLEG_ID}`,
        data: payload,
        method: 'post',
    });
    console.log(resp);
};
</script>

<template>
    <div class="pt-4">
        <div>
            <h5 class="text-h5 pb-4">Введите контактные данные</h5>
            <v-form v-model="valid">
                <v-text-field placeholder="Last name" v-model="form.last_name" :rules="required" />
                <v-text-field placeholder="Name" v-model="form.fullname" :rules="required" />
                <v-text-field placeholder="Phone" v-model="form.phone" :rules="required" />
                <v-text-field placeholder="E-mail" v-model="form.email" :rules="emailRules" />
                <v-textarea :counter="150" placeholder="Comment" v-model="form.comment" />
                <v-checkbox
                    :label="'I agree to the processing of my personal data and confirm that I have read and accepted the Privacy Policy and User Agreement'"
                    v-model="form.notify_by_sms"
                />
                <h5 class="text-h5 pb-5">{{ getSum }} ฿</h5>
                <v-btn color="primary" :disabled="!valid" @click="sendForm">Book</v-btn>
            </v-form>
        </div>
    </div>
</template>

<style scoped></style>
