<?php
namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;


class AuthController extends Controller
{
public function register(Request $r)
{
$data = $r->validate([
'name' => 'required|string',
'email' => 'required|email|unique:users',
'password' => 'required|min:6'
]);


$user = User::create([
'name'=>$data['name'],
'email'=>$data['email'],
'password'=>Hash::make($data['password'])
]);


$token = $user->createToken('web-token')->plainTextToken;
return response()->json(['user'=>$user,'token'=>$token]);
}


public function login(Request $r)
{
$data = $r->validate(['email'=>'required|email','password'=>'required']);
$user = User::where('email',$data['email'])->first();
if(!$user || !Hash::check($data['password'],$user->password)) {
return response()->json(['message'=>'Invalid credentials'], 401);
}
$user->tokens()->delete();
$token = $user->createToken('web-token')->plainTextToken;
return response()->json(['user'=>$user,'token'=>$token]);
}


public function logout(Request $r)
{
$r->user()->tokens()->delete();
return response()->json(['message'=>'Logged out']);
}
}