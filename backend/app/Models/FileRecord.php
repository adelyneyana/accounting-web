<?php
namespace App\Models;


use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class FileRecord extends Model
{
use HasFactory;


protected $table = 'files';
protected $fillable = ['user_id','name','description','filename','path','mime','size','storage'];


public function user() { return $this->belongsTo(User::class); }
}