document.getElementById('optimizeButton').addEventListener('click', function() {
    // Récupérer l'élément spinner
    var loader = document.getElementById('loader');

    // Afficher le spinner
    loader.style.display = 'block';

    // Sélectionner l'élément de résultat et le vider
    var resultElement = document.getElementById('result');
    resultElement.innerHTML = '';

    // Récupérer les valeurs de longueur et de coupes
    var barLength = document.getElementById('bar_length').value;
    var cuts = document.getElementById('cuts').value;

    // Vérifier si la longueur de barre ou les tasseaux sont vides
    if (!barLength || !cuts.trim()) {
        loader.style.display = 'none'; // Arrête le spinner
        alert("Données incorrectes pour l'optimisation !");
        return; // Arrête l'exécution de la fonction
    }   

    // Nettoyage de la chaîne 'cuts'

    cuts = cuts.replace(/^[^\d]+/, ''); // Enlever tous les caractères avant le premier chiffre

    cuts = cuts.replace(/\t/g, ',') // Remplacer la tabulation par une virgule
                .replace(/\n+/g, ';') // Remplacer les retours à la ligne par des points-virgules
      //          .replace(/\s+/g, '') // Enlever les espaces
                .replace(/,+/g, ',') // Remplacer les multiples virgules par une seule
                .replace(/;+/g, ';') // Remplacer les multiples points virgules par un seul            
                .replace(/;+$/, '') // Enlever le point virgule final si présent
                .replace(/[^\d;,]/g, '');  // Enlever tous les caractères autres que numériques, virgules, et points-virgules

               //alert(cuts);
               
    // Traitement des données des tasseaux
    try {   
    var data = {
        bar_length: parseInt(barLength),
        tasseaux: cuts.split(';').map(function(cut) {
            var parts = cut.split(',');
            return [parseInt(parts[0].trim()), parseInt(parts[1].trim())];
        })
    };

    } catch (error) {
        loader.style.display = 'none'; // Arrête le spinner
        alert("Données des tasseaux incorrectes pour l'optimisation !");
    }

    // Envoi de la requête à l'API
    fetch('http://51.75.252.78:8000/optimize/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        let resultText = '';
        for (const [cut, quantity] of Object.entries(data.cuts)) {
            resultText += `${cut} : ${quantity}\n`; // Ajoute chaque découpe sur une nouvelle ligne
        }
        resultText += `Nombre total de barres : ${data.total_bars}`; // Ajoute le total des barres à la fin
        document.getElementById('result').innerText = resultText;

        // Cacher le spinner
        loader.style.display = 'none';        

    })
    .catch(error => {
        console.error('Error:', error);

        // Cacher le spinner en cas d'erreur
        loader.style.display = 'none';
    });


});
