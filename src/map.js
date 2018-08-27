import { loadList, loadDetails } from './api';
import { getDetailsContentLayout } from './details';
import { createFilterControl } from './filter';

export default function initMap(ymaps, containerId) { // не хватало 'default'
  const myMap = new ymaps.Map(containerId, {
    center: [55.76, 37.64],
    controls: [],
    zoom: 10
  });

  const objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 64,
    clusterIconLayout: 'default#pieChart',
    clusterDisableClickZoom: false,
    geoObjectOpenBalloonOnClick: false,
    geoObjectHideIconOnBalloonOpen: false,
    geoObjectBalloonContentLayout: getDetailsContentLayout() // в данном случае передавать в функцию аргумент не обязательно
  });

  // objectManager.clusters.options.set('preset', 'islands#greenClusterIcons'); Убираем чтобы пофиксить иконки кластеров

  loadList().then(data => {
    objectManager.add(data);
		myMap.geoObjects.add(objectManager); // Добавляем элементы на карту
		
		if(objectManager.getBounds() !== null) { // Центрируем карту 
			myMap.setBounds(objectManager.getBounds());
		}
  });

  // details
  objectManager.objects.events.add('click', event => {
    const objectId = event.get('objectId');
    const obj = objectManager.objects.getById(objectId);

    objectManager.objects.balloon.open(objectId);

    if (!obj.properties.details) {
      loadDetails(objectId).then(data => {
        obj.properties.details = data;
        objectManager.objects.balloon.setData(obj);
      });
    }
  });

  // filters
  const listBoxControl = createFilterControl();
	const filterMonitor = new ymaps.Monitor(listBoxControl.state);

  myMap.controls.add(listBoxControl);

  filterMonitor.add('filters', filters => {
    objectManager.setFilter(
      obj => filters[obj.isActive ? 'active' : 'defective']
    );
  });
}