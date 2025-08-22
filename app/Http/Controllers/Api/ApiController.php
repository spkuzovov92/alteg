<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;
use Symfony\Component\HttpKernel\Exception\HttpException;

class ApiController extends Controller
{
    public function sendRequest(Request $request) {
        $url = $request->input('url');
        $method = strtolower($request->input('method', 'get')); // default GET
        $data = $request->input('data', []);

        if (preg_match('/^(http:\/\/localhost|http:\/\/127\.0\.0\.1)/', $url)) {
            return response()->json(['error' => 'Запрос к локальным адресам запрещён'], 400);
        }

        try {
            $http = Http::withHeaders([
                'Authorization' => env('API_AUTHORIZATION'),
                'Accept' => 'application/vnd.api.v2+json',
            ]);
             $response = match ($method) {
                'get'    => $http->get($url, $data),
                'post'   => $http->post($url, $data),
                'put'    => $http->put($url, $data),
                'patch'  => $http->patch($url, $data),
                'delete' => $http->delete($url, $data),
                default  => $http->send(strtoupper($method), $url, ['form_params' => $data]),
            };

            if ($response->status() !== 200) {
                throw new HttpException(
                    $response->status(),
                    $response->body() ?: 'Ошибка запроса'
                );
            }

            return response()->json($response->json() ?? $response->body());
        }
        catch (\Exception $e) {
             return response()->json($e->getMessage(), $e->getCode() > 0 ? $e->getCode() : 500);
        }
    }
}
