<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
public function up()
{
Schema::create('files', function (Blueprint $table) {
$table->id();
$table->foreignId('user_id')->constrained()->cascadeOnDelete();
$table->string('name'); // Display name
$table->text('description')->nullable(); // File description
$table->string('filename'); // Original filename
$table->string('path');
$table->string('mime')->nullable();
$table->bigInteger('size')->nullable();
$table->string('storage')->default('local');
$table->timestamps();
});
}


public function down()
{
Schema::dropIfExists('files');
}
};