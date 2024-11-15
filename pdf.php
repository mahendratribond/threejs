<?php
require_once __DIR__ . '/vendor/autoload.php';

use Mpdf\Mpdf;

$mpdf = new Mpdf();

// CSS styles with fixed table layout and overflow handling
$stylesheet = '
<style>
    .main-table {
        width: 100%;
        table-layout: fixed; /* This ensures fixed column widths */
        border-collapse: collapse;
    }
    .image-cell {
        width: 55%;
        vertical-align: top;
        padding: 10px;
        position: relative;
        overflow: hidden; /* Prevents image overflow */
    }
    .content-cell {
        width: 45%;
        vertical-align: top;
        padding: 10px;
    }
    .image-container {
        width: 100%;
        position: relative;
    }
    .responsive-img {
        width: 100%; /* Forces image to fit container width */
        height: auto;
        display: block; /* Removes any extra spacing */
        max-width: none; /* Allows image to scale down without restrictions */
    }
</style>
';

// HTML content with image container
$html = '
' . $stylesheet . '
<table class="main-table">
    <tr>
        <td class="image-cell">
            <div class="image-container">
                <img src="path/to/your/image.jpg" class="responsive-img">
            </div>
        </td>
        <td class="content-cell">
            Your content here
        </td>
    </tr>
</table>
';

$mpdf->WriteHTML($html);
$mpdf->Output();
?>