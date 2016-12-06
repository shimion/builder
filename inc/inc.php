<?php
$dir = inc . 'class';
$scanned_directory = array_diff(scandir($dir), array('..', '.'));
//print_r($scanned_directory);
foreach ($scanned_directory as $class){
	//print($login);
	require_once(inc . 'class/'.$class.'');
}

