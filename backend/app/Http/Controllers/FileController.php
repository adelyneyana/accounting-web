<?php
namespace App\Http\Controllers;


use Illuminate\Http\Request;
use App\Models\FileRecord;
use Illuminate\Support\Facades\Storage;


class FileController extends Controller
{
public function index(Request $r)
{
$files = $r->user()->files()->latest()->get();
return response()->json($files);
}


public function upload(Request $r)
{
$r->validate([
'file'=>'required|file|max:51200',
'name'=>'required|string|max:255',
'description'=>'nullable|string|max:1000'
]);
$file = $r->file('file');
$path = $file->store('user_uploads/'.$r->user()->id, 'public');
$rec = FileRecord::create([
'user_id' => $r->user()->id,
'name' => $r->input('name'),
'description' => $r->input('description'),
'filename' => $file->getClientOriginalName(),
'path' => $path,
'mime' => $file->getClientMimeType(),
'size' => $file->getSize(),
'storage' => 'local'
]);
return response()->json($rec, 201);
}


public function download(Request $r, FileRecord $file)
{
if ($file->user_id !== $r->user()->id) abort(403);
return Storage::disk('public')->download($file->path, $file->filename);
}


public function destroy(Request $r, FileRecord $file)
{
if ($file->user_id !== $r->user()->id) abort(403);
Storage::disk('public')->delete($file->path);
$file->delete();
return response()->json(['message'=>'deleted']);
}
}