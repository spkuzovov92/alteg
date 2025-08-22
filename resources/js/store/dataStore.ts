import { defineStore } from 'pinia';
import { Reactive, reactive } from 'vue';
import { rest, sendRequest } from '@/plugins/axios';
const companyId = import.meta.env.VITE_ATLEG_ID

export const useDataStore = defineStore('data', () => {
    const slots: Reactive<any> = reactive([])
    const data = reactive([])
    const employees:Reactive<any> = reactive([])
    const items: Reactive<Array<{id: number, name: string}>> = reactive([])
    const loadSlots = async (date: string) => {
        const payload = {
            context: {
                location_id: companyId
            },
            filter: {
                date,
                records: [
                    {
                        attendance_service_items: items.map(item => {
                            return {
                                type: "service",
                                id: item.id
                            }
                        })
                    }
                ]
            }
        }
        const resp = await sendRequest({url: 'booking/search/timeslots', method: 'post', data: payload})
        if(resp.data.success) {
            resp.data.data.forEach((item: any) => {
                slots.push(item)
            })
        }
    }

    const loadEmployees = async () => {
        const resp = await sendRequest({url: `company/${companyId}/staff`})
        if(resp.data.success) {
            resp.data.data.forEach((item: any) => {
                employees.push(item)
            })
        }
    }

    return {loadSlots, data, employees, loadEmployees}
})
