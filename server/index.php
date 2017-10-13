<?php

header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
header("Access-Control-Allow-Headers: Origin, X-Requested-With,Content-Type, Accept");
header('Access-Control-Allow-Methods: POST');

//$post_body = file_get_contents('php://input');

echo $_POST['imgBase64'];

//if (isset($GLOBALS["HTTP_RAW_POST_DATA"])) {
//  $imageData = $GLOBALS['HTTP_RAW_POST_DATA'];
//  $filteredData = substr($imageData, strpos($imageData, ",") + 1);
//  $unencodedData = base64_decode($filteredData);
//  $fp = fopen('/path/to/file.png', 'wb');
//
//  fwrite($fp, $unencodedData);
//  fclose($fp);
//}

if (isset($_POST['imgBase64'])) {
  $upload_dir = 'handwriting/';
  $img = $_POST['imgBase64'];
  $img = str_replace('data:image/png;base64,', '', $img);
  $img = str_replace(' ', '+', $img);
  $data = base64_decode($img);
  $file = $upload_dir."handwriting.png";
  $success = file_put_contents($file, $data);
  print $success ? $file : 'Unable to save the file.';

//   file_put_contents('/handwriting/sample1.png', $data);
} else {
  echo 'Image is not set.';
}

?>