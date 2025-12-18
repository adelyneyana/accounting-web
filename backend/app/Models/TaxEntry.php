<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class TaxEntry extends Model
{
use HasFactory;


protected $fillable = ['user_id','taxpayer_type','label','value','meta'];


protected $casts = [
'meta' => 'array',
'value' => 'decimal:2'
];


public function user() { return $this->belongsTo(User::class); }
}