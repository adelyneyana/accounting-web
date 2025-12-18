<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaxController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\UserController;


Route::post('/register', [AuthController::class,'register']);
Route::post('/login', [AuthController::class,'login']);


Route::middleware('auth:sanctum')->group(function(){
Route::post('/logout', [AuthController::class,'logout']);

// User Profile Routes
Route::get('/user/profile', [UserController::class,'getProfile']);
Route::put('/user/profile', [UserController::class,'updateProfile']);
Route::put('/user/password', [UserController::class,'updatePassword']);

// Tax Routes (auth required to save/load user-specific data)
Route::get('/tax', [TaxController::class,'index']);
Route::post('/tax', [TaxController::class,'store']);
Route::put('/tax/{taxEntry}', [TaxController::class,'update']);
Route::post('/tax/summary', [TaxController::class,'saveSummary']);
Route::put('/tax/type/update', [TaxController::class,'updateType']);
Route::delete('/tax/{taxEntry}', [TaxController::class,'destroy']);

// File Routes
Route::get('/files', [FileController::class,'index']);
Route::post('/files/upload', [FileController::class,'upload']);
Route::get('/files/{file}/download', [FileController::class,'download']);
Route::delete('/files/{file}', [FileController::class,'destroy']);
});