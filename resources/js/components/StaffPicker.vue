<script setup lang="ts">
    import { useDataStore } from '@/store/dataStore';
    import { computed, onMounted, Reactive, reactive, ref, Ref, toRefs } from 'vue';
    import { sendRequest } from '@/plugins/axios';

    const dataStore = useDataStore()
    const {userServices} = toRefs(dataStore)
    const getServicesByUser = computed(() =>  userServices.value.find(item => item.staff_id === null))
    const getStaffs = computed(() => dataStore.mainData.staff)
    const freeSpecialists: Reactive<Array<any>> = reactive([])
    const activeSpecialist: Ref<number | null> = ref(null)
    const loadStaffs = async () => {
        if(!getServicesByUser.value) return
        const payload = {
            context: {
                location_id: Number(import.meta.env.VITE_ATLEG_ID),
            },
            filter: {
                datetime: getServicesByUser.value?.datetime,
                records: getServicesByUser.value.services.map((item: any) => {
                    return {
                        staff_id: null,
                        attendance_service_items: [{
                            type: 'service',
                            id: item.id
                        }]
                    }
                } )
            },
        }
        const resp = await sendRequest({url: 'booking/search/staff', data: payload, method: 'post'})
        if(resp.data.data) Object.assign(freeSpecialists, resp.data.data)
    }
    const getFreeSpecialist = computed(() => {
        return getStaffs.value.filter((item: any) => freeSpecialists.find((val: any) => Number(val.id) === item.id))
    })
    const goToStepTwo = () => {
        if(!getServicesByUser.value || !activeSpecialist.value) return
        const index = userServices.value.indexOf(getServicesByUser.value)
        if(index !== -1) {
            dataStore.changeStaffId(index, activeSpecialist.value)
        }
        dataStore.changeActiveStep(2)
    }
    const goToNextStep = () => {
        if(!getServicesByUser.value || !activeSpecialist.value) return
        const index = userServices.value.indexOf(getServicesByUser.value)
        if(index !== -1) {
            dataStore.changeStaffId(index, activeSpecialist.value)
        }
        dataStore.changeActiveStep(4)
    }
    const isDisabled = (id: number) => {
        return !(freeSpecialists.find((item: any) => Number(item.id) === id)?.attributes.is_bookable)
    }
    onMounted(() => loadStaffs())
</script>

<template>
    <div class="pt-4">
        <div>
            <h5 class="text-h5 pb-4">Выберите специалиста</h5>
            <v-card v-for="staff in getFreeSpecialist" :key=staff.id class="mb-4" @click="activeSpecialist = staff.id" :disabled="isDisabled(staff.id)">
                <v-row class="px-4 pt-2">
                    <v-col cols="11">
                        <div class="d-flex">
                            <div>
                                <v-avatar size="64" :image="staff.avatar"/>
                            </div>
                            <div class="pl-2">
                                <h4 class="text-h5 text-bold">{{staff.name}}</h4>
                                <p >{{staff.specialization}}</p>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="1" class="text-right">
                        <v-checkbox v-model="activeSpecialist" :value="staff.id"/>
                    </v-col>
                </v-row>
            </v-card>
            <v-row class="pt-4" v-if="activeSpecialist">
                <v-col cols="12">
                    <div class="d-flex align-end w-100 justify-end">
                        <v-btn color="primary" @click="goToStepTwo">Добавить услуги</v-btn>
                        <v-btn color="primary" class="ml-2"  @click="goToNextStep">Оформить заказ</v-btn>
                    </div>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<style scoped>

</style>
