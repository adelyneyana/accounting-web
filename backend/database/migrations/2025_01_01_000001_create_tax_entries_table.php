<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;


return new class extends Migration {
    public function up()
    {
        Schema::create('tax_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('taxpayer_type', ['individual', 'corporation'])->default('individual');
            $table->string('label');
            $table->decimal('value', 18, 2)->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }
public function down()
{
Schema::dropIfExists('tax_entries');
}
};